import React, { useState, useMemo, useCallback } from 'react';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProductAPI, RequestAPI, handleApiError } from '../../services/ApiService';
import { getCurrentUser } from '../../services/AuthService';

// Importaciones para el Lightbox
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// --- Componente auxiliar para la carga de archivos ---
const FileUploader = ({ label, onFileChange, accept, required }) => {
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
      />
    </div>
  );
};

export const STNueva = () => {
  // --- ESTADOS ---
  const [requestType, setRequestType] = useState(null); // null | 'repuestos' | 'envio'
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Paso 1
  const [skuInput, setSkuInput] = useState('');
  const [productData, setProductData] = useState(null);
  const [numeroSerie, setNumeroSerie] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [fechaCompra, setFechaCompra] = useState('');

  // Paso 2
  const [fallaObservaciones, setFallaObservaciones] = useState('');
  const [selectedRepuestos, setSelectedRepuestos] = useState([]); // Array de {codigo, cantidad}
  const [repuestosDisponibles, setRepuestosDisponibles] = useState([]);

  // Paso 3
  const [facturaFile, setFacturaFile] = useState(null);
  const [garantiaFile, setGarantiaFile] = useState(null);
  const [imagenesProducto, setImagenesProducto] = useState(null);

  // Estados para el Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // --- LÓGICA ---
  const totalSteps = requestType === 'envio' ? 3 : 4;
  
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const openLightboxWithImage = (imagePath) => {
    setLightboxImage(imagePath);
    setLightboxOpen(true);
  };

  const handleRequestTypeSelection = (type) => {
    setRequestType(type);
  };

  // Función con debounce y autocompletado
  const handleSkuChange = useCallback((e) => {
    const sku = e.target.value.toUpperCase();
    setSkuInput(sku);
    setError('');
    
    console.log('SKU ingresado:', sku);
    
    // Limpiar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Limpiar producto si no hay suficientes caracteres
    if (sku.length < 3) {
      setProductData(null);
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    // Búsqueda inmediata para autocompletado
    const newTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        console.log('Buscando producto...');
        const response = await ProductAPI.getProductBySKU(sku);
        console.log('Respuesta API:', response);
        
        if (response.success && response.product) {
          // Producto exacto encontrado
          setProductData(response.product);
          setShowSuggestions(false);
          setSuggestions([]);
          console.log('Producto encontrado:', response.product);
        } else {
          // No encontrado exactamente, buscar sugerencias
          setProductData(null);
          await buscarSugerencias(sku);
        }
      } catch (error) {
        console.error('Error buscando producto:', error);
        setProductData(null);
        // Si no encuentra exacto, buscar sugerencias
        await buscarSugerencias(sku);
        if (!error.message.includes('404') && !error.message.includes('no encontrado')) {
          setError(handleApiError(error));
        }
      } finally {
        setLoading(false);
      }
    }, 300); // Reducido para más inmediatez
    
    setSearchTimeout(newTimeout);
  }, [searchTimeout]);

  // Función para buscar sugerencias parciales
  const buscarSugerencias = async (sku) => {
    try {
      // Lista de productos disponibles (esto podría venir de un endpoint específico)
      const productosDisponibles = [
        { sku: 'NM10', nombre: 'Nebulizador Médico NM10', warranty_days: 90 },
        { sku: 'N30', nombre: 'Nebulizador N30 Profesional', warranty_days: 30 }
      ];
      
      // Filtrar sugerencias que coincidan parcialmente
      const sugerencias = productosDisponibles.filter(product => 
        product.sku.includes(sku) || product.nombre.toLowerCase().includes(sku.toLowerCase())
      );
      
      setSuggestions(sugerencias);
      setShowSuggestions(sugerencias.length > 0);
      
    } catch (error) {
      console.error('Error buscando sugerencias:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Función para seleccionar una sugerencia
  const seleccionarSugerencia = async (suggestion) => {
    setSkuInput(suggestion.sku);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Buscar producto completo
    try {
      setLoading(true);
      const response = await ProductAPI.getProductBySKU(suggestion.sku);
      if (response.success && response.product) {
        setProductData(response.product);
      }
    } catch (error) {
      console.error('Error cargando producto seleccionado:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepTwoNext = async () => {
    if (fallaObservaciones.trim() === '') return;
    
    // Si es envío, saltar directamente al siguiente paso
    if (requestType === 'envio') {
      nextStep();
      return;
    }
    
    // Si es repuestos, cargar repuestos
    setLoading(true);
    setError('');
    
    try {
      const response = await ProductAPI.getPartsByProductId(productData.id);
      console.log('Repuestos response:', response);
      
      if (response.success && response.data && response.data.parts) {
        setRepuestosDisponibles(response.data.parts);
      } else {
        setRepuestosDisponibles([]);
      }
      nextStep();
    } catch (error) {
      console.error('Error cargando repuestos:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRepuestoChange = (codigo, isChecked, cantidad = 1) => {
    setSelectedRepuestos(prev => {
      if (isChecked) {
        // Agregar repuesto con cantidad
        return [...prev.filter(r => r.codigo !== codigo), { codigo, cantidad }];
      } else {
        // Remover repuesto
        return prev.filter(r => r.codigo !== codigo);
      }
    });
  };

  const handleCantidadChange = (codigo, nuevaCantidad) => {
    setSelectedRepuestos(prev => 
      prev.map(r => r.codigo === codigo ? { ...r, cantidad: nuevaCantidad } : r)
    );
  };

  const isRepuestoSelected = (codigo) => {
    return selectedRepuestos.some(r => r.codigo === codigo);
  };

  const getCantidadRepuesto = (codigo) => {
    const repuesto = selectedRepuestos.find(r => r.codigo === codigo);
    return repuesto ? repuesto.cantidad : 1;
  };
  
 const handleConfirmar = async () => {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      setError('Usuario no autenticado');
      return;
    }

    // Preparar datos de la solicitud (sin archivos en el objeto principal)
    const requestData = {
      user_name: currentUser.name,
      user_email: currentUser.email,
      product_sku: skuInput,
      product_name: productData.nombre,
      serial_number: numeroSerie,
      purchase_date: fechaCompra,
      warranty_number: 'N/A',
      fault_description: fallaObservaciones,
      request_type: requestType, // 'repuestos' o 'envio'
      selected_parts: selectedRepuestos.map(item => {
        const repuesto = repuestosDisponibles.find(r => r.codigo === item.codigo);
        return {
          codigo: item.codigo,
          descripcion: repuesto ? repuesto.descripcion : item.codigo,
          cantidad: item.cantidad
        };
      })
    };

    // ============================================
    // CAMBIO: Preparar archivos reales para FormData
    // ============================================
    const files = {
      factura: facturaFile,      // Archivo real, no el nombre
      garantia: garantiaFile,    // Archivo real, no el nombre
      imagenes: imagenesProducto // Archivo real, no el nombre
    };

    setLoading(true);
    setError('');

    try {
      // Enviar tanto datos como archivos
      const response = await RequestAPI.createRequest(requestData, files);
      console.log("Solicitud guardada:", response);
      nextStep();
    } catch (error) {
      console.error('Error guardando solicitud:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERIZADO ---
  return (
    <div className="p-4 max-w-lg mx-auto">
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[{ src: lightboxImage }]}
      />

      {/* --- PASO 0: Selector de Tipo de Solicitud --- */}
      {requestType === null && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2 text-gray-800">Nueva Solicitud</h1>
            <p className="text-sm text-gray-600 mb-6">Selecciona el tipo de solicitud</p>
          </div>

          <div className="space-y-4">
            {/* Card Repuestos en Garantía */}
            <button
              onClick={() => handleRequestTypeSelection('repuestos')}
              className="w-full p-6 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all active:scale-98 text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="text-5xl">📦</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">Repuestos en Garantía</h3>
                  <p className="text-sm text-gray-600 mt-1">Solicitar piezas para reparación</p>
                </div>
              </div>
            </button>

            {/* Card Envío del Producto */}
            <button
              onClick={() => handleRequestTypeSelection('envio')}
              className="w-full p-6 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all active:scale-98 text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="text-5xl">🚚</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">Envío del Producto</h3>
                  <p className="text-sm text-gray-600 mt-1">Enviar equipo completo</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Header con pasos (solo si ya seleccionó tipo) */}
      {requestType !== null && step <= totalSteps && (
        <>
          <h1 className="text-xl font-bold mb-2 text-gray-800">
            Nueva Solicitud - {requestType === 'repuestos' ? 'Repuestos en Garantía' : 'Envío del Producto'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">Paso {step} de {totalSteps}</p>
        </>
      )}

      {/* Mostrar errores */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {/* --- PASO 1: Datos del producto --- */}
      {requestType !== null && step === 1 && (
        <div className="space-y-5">
          <div className="relative">
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
              Ingresar Modelo del Producto {loading && <span className="text-blue-500">(buscando...)</span>}
            </label>
            <Input 
              type="text" 
              id="sku" 
              value={skuInput} 
              onChange={handleSkuChange} 
              placeholder="Ej: N30, NM10 (mínimo 3 caracteres)" 
              disabled={loading}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              onFocus={() => {
                if (suggestions.length > 0 && skuInput.length >= 3) {
                  setShowSuggestions(true);
                }
              }}
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                    Sugerencias de productos:
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => seleccionarSugerencia(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                          {suggestion.sku.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{suggestion.sku}</p>
                          <p className="text-sm text-gray-600">{suggestion.nombre}</p>
                          <p className="text-xs text-green-600 font-medium">
                            Garantía: {suggestion.warranty_days} días
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              Escribe al menos 3 caracteres para ver sugerencias
            </p>
          </div>
          
          {productData && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-4">
              <img 
                src={productData.imagen || `https://placehold.co/150x150/dddddd/333333?text=${skuInput}`}
                alt={productData.nombre}
                className="w-16 h-16 object-cover rounded-md cursor-pointer hover:opacity-80 transition bg-gray-200"
                onClick={() => openLightboxWithImage(productData.imagen || `https://placehold.co/600x600/dddddd/333333?text=${skuInput}`)}
              />
              <div className="flex-1">
                <p className="font-semibold text-blue-800">{productData.nombre}</p>
                <p className="text-sm text-blue-600">SKU: {productData.sku}</p>
                <p className="text-xs text-green-700 font-medium mt-1">
                  ✓ Garantía: {productData.warranty_days} días
                </p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="numeroSerie" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Serie
            </label>
            <Input 
              type="text" 
              id="numeroSerie" 
              value={numeroSerie} 
              onChange={(e) => setNumeroSerie(e.target.value)} 
              placeholder="Ingresa el número de serie"
            />
          </div>

          <div>
            <label htmlFor="fechaCompra" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Compra <span className="text-red-500">*</span>
            </label>
            <Input 
              type="date" 
              id="fechaCompra" 
              value={fechaCompra} 
              onChange={(e) => setFechaCompra(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500 mt-1">
              Fecha en que se adquirió el producto
            </p>
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={nextStep} 
              disabled={!productData || !fechaCompra || loading}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* --- PASO 2: Diagnóstico --- */}
      {requestType !== null && step === 2 && (
        <div className="space-y-5">
          <div>
            <label htmlFor="falla" className="block text-sm font-medium text-gray-700 mb-1">
              Falla - Observaciones <span className="text-red-500">*</span>
            </label>
            <textarea 
              id="falla" 
              rows="4" 
              value={fallaObservaciones} 
              onChange={(e) => setFallaObservaciones(e.target.value)} 
              className="w-full border border-gray-300 rounded-md p-2" 
              required
            />
          </div>
          
          {requestType === 'repuestos' && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">
                Repuestos para: <span className="font-semibold text-blue-800">{productData?.nombre}</span>
              </h3>
              <p className="text-xs text-gray-500 mb-2">Se cargarán al avanzar al siguiente paso</p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button type="button" onClick={prevStep} variant="outline">Atrás</Button>
            <Button 
              type="button" 
              onClick={handleStepTwoNext} 
              disabled={fallaObservaciones.trim() === '' || loading}
            >
              {loading ? 'Cargando...' : 'Siguiente'}
            </Button>
          </div>
        </div>
      )}

      {/* --- PASO 3: Selección de repuestos (SOLO para tipo 'repuestos') --- */}
      {requestType === 'repuestos' && step === 3 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Repuestos disponibles para: <span className="font-semibold text-blue-800">{productData?.nombre}</span>
            </h3>
            <div className="space-y-2 rounded-md border border-gray-200 p-3 max-h-60 overflow-y-auto">
              {repuestosDisponibles.length > 0 ? (
                repuestosDisponibles.map(repuesto => (
                  <div key={repuesto.codigo} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md border-b border-gray-100 last:border-b-0">
                    <img 
                      src={repuesto.imagen || `https://placehold.co/100x100/eeeeee/555555?text=${repuesto.codigo}`}
                      alt={repuesto.descripcion}
                      className="w-12 h-12 object-cover rounded-md cursor-pointer hover:opacity-80 transition bg-gray-200"
                      onClick={() => openLightboxWithImage(repuesto.imagen || `https://placehold.co/600x600/eeeeee/555555?text=${repuesto.codigo}`)}
                    />
                    <div className="flex-1">
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isRepuestoSelected(repuesto.codigo)} 
                          onChange={(e) => handleRepuestoChange(repuesto.codigo, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{repuesto.codigo}</p>
                          <p className="text-xs text-gray-600">{repuesto.descripcion}</p>
                        </div>
                      </label>
                    </div>
                    {isRepuestoSelected(repuesto.codigo) && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Cantidad:</span>
                        {repuesto.max_cantidad === 1 ? (
                          <span className="w-12 text-center py-1 px-2 bg-gray-100 rounded border text-sm">1</span>
                        ) : (
                          <select 
                            value={getCantidadRepuesto(repuesto.codigo)}
                            onChange={(e) => handleCantidadChange(repuesto.codigo, parseInt(e.target.value))}
                            className="w-12 text-center py-1 px-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {Array.from({ length: repuesto.max_cantidad }, (_, i) => i + 1).map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        )}
                        <span className="text-xs text-gray-500">
                          (máx: {repuesto.max_cantidad})
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hay repuestos disponibles para este producto</p>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button type="button" onClick={prevStep} variant="outline">Atrás</Button>
            <Button type="button" onClick={nextStep}>Siguiente</Button>
          </div>
        </div>
      )}

      {/* --- PASO 3 o 4: Carga de Archivos (según tipo) --- */}
      {requestType !== null && ((requestType === 'envio' && step === 3) || (requestType === 'repuestos' && step === 4)) && (
        <div className="space-y-5">
          <FileUploader 
            label="Cargar Factura" 
            onFileChange={setFacturaFile}
            required={requestType === 'envio'}
          />
          <FileUploader 
            label="Cargar Garantía" 
            onFileChange={setGarantiaFile}
            required={requestType === 'envio'}
          />
          <FileUploader 
            label="Cargar Imágenes del Producto" 
            onFileChange={setImagenesProducto} 
            accept="image/*"
            required={false}
          />

          {requestType === 'envio' && (
            <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-2">
              ⚠️ Factura y Garantía son obligatorias para envío del producto
            </p>
          )}

          <div className="flex justify-between pt-2">
            <Button type="button" onClick={prevStep} variant="outline">Atrás</Button>
            <Button 
              type="button" 
              onClick={nextStep}
              disabled={requestType === 'envio' && (!facturaFile || !garantiaFile)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
      
      {/* --- PASO 4 o 5: Confirmación (según tipo) --- */}
      {requestType !== null && ((requestType === 'envio' && step === 4) || (requestType === 'repuestos' && step === 5)) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Resumen de la Solicitud</h3>
          
          <div>
            <strong>Tipo de Solicitud:</strong>
            <p>{requestType === 'repuestos' ? '📦 Repuestos en Garantía' : '🚚 Envío del Producto'}</p>
          </div>
          
          <div><strong>Producto:</strong><p>{productData?.nombre} ({skuInput})</p></div>
          <div><strong>N° de Serie:</strong><p>{numeroSerie || 'No ingresado'}</p></div>
          <div><strong>Falla/Observaciones:</strong><p>{fallaObservaciones}</p></div>
          
          {requestType === 'repuestos' && (
            <div><strong>Repuestos Solicitados:</strong>
              <p>
                {selectedRepuestos.length > 0 ? (
                  selectedRepuestos.map(item => `${item.codigo} (x${item.cantidad})`).join(', ')
                ) : (
                  'Ninguno'
                )}
              </p>
            </div>
          )}
          
          <div><strong>Archivos Adjuntos:</strong>
            <ul className="list-disc list-inside text-sm">
              <li>Factura: {facturaFile?.name || 'No adjunta'}</li>
              <li>Garantía: {garantiaFile?.name || 'No adjunta'}</li>
              <li>Imágenes: {imagenesProducto?.name || 'No adjuntas'}</li>
            </ul>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button type="button" onClick={prevStep} variant="outline">Atrás</Button>
            <Button type="button" onClick={handleConfirmar} disabled={loading}>
              {loading ? 'Guardando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      )}
      
      {/* --- PASO FINAL: Mensaje de Éxito --- */}
      {requestType !== null && ((requestType === 'envio' && step === 5) || (requestType === 'repuestos' && step === 6)) && (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-green-600">¡Solicitud Enviada!</h2>
          <p className="mt-2 text-gray-700">Tu solicitud ha sido registrada correctamente en la base de datos.</p>
          <div className="mt-6">
            <Button onClick={() => {
              setRequestType(null);
              setStep(1);
              setSkuInput('');
              setProductData(null);
              setNumeroSerie('');
              setFechaCompra('');
              setFallaObservaciones('');
              setSelectedRepuestos([]);
              setRepuestosDisponibles([]);
              setFacturaFile(null);
              setGarantiaFile(null);
              setImagenesProducto(null);
              setSuggestions([]);
              setShowSuggestions(false);
            }}>
              Nueva Solicitud
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};