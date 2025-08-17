# 🤖 Configuración de IA Local - Ollama + Llama 3

## 🚀 **Paso 1: Instalar Ollama**

### Windows/Mac:
1. Ve a https://ollama.com/
2. Descarga e instala Ollama
3. Una vez instalado, abre una terminal

### Linux:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

## 🧠 **Paso 2: Descargar Llama 3**

Ejecuta en tu terminal:

```bash
# Opción 1: Llama 3.2 (más rápido, 3B parámetros)
ollama pull llama3.2

# Opción 2: Llama 3.1 (más potente, 8B parámetros)
ollama pull llama3.1:8b

# Opción 3: Si tienes mucha RAM (70B parámetros)
ollama pull llama3.1:70b
```

**Recomendado**: Usa `llama3.2` para desarrollo, es más rápido.

## 🔧 **Paso 3: Instalar dependencias del backend**

```bash
cd api-backend
npm install
```

## ▶️ **Paso 4: Iniciar los servicios**

### Terminal 1 - Ollama (si no se inició automáticamente):
```bash
ollama serve
```

### Terminal 2 - Backend:
```bash
cd api-backend
npm run dev
```

### Terminal 3 - Frontend:
```bash
cd BOLT
npm run dev
```

## ✅ **Verificar que funciona**

1. Ve a http://localhost:3001/api/ai/status
2. Deberías ver:
```json
{
  "isReady": true,
  "modelName": "llama3.2",
  "service": "Ollama + Llama 3"
}
```

3. Ve al editor de clases en http://localhost:5173/editor
4. En el **Paso 3**, verás el panel **"Asistente Inteligente con IA"**
5. Al seleccionar un template, la IA debería generar recomendaciones reales

## 🐛 **Troubleshooting**

### Error: "No se pudo conectar a Ollama"
- Verifica que Ollama esté corriendo: `ollama --version`
- Reinicia el servicio: `ollama serve`

### Error: "Model not found"
- Verifica modelos instalados: `ollama list`
- Reinstala el modelo: `ollama pull llama3.2`

### La IA está muy lenta
- Usa un modelo más pequeño: `llama3.2` en lugar de `llama3.1:8b`
- Verifica RAM disponible: necesitas al menos 4GB libres

### Las recomendaciones siguen siendo genéricas
- Verifica en la consola del backend si hay logs de `🤖 Generando recomendaciones con IA...`
- Si no aparecen, la IA no está conectada correctamente

## 💡 **¿Qué hace la IA ahora?**

**Antes**: Solo reglas simuladas
**Ahora**: Llama 3 real que:

- ✅ **Analiza el contexto pedagógico** del template y contenidos actuales
- ✅ **Razona sobre qué tipos de contenido** son más efectivos educativamente
- ✅ **Considera el dispositivo** (móvil vs desktop) para optimización
- ✅ **Genera explicaciones personalizadas** para cada recomendación
- ✅ **Se adapta al tema** (matemáticas, ciencias, historia, etc.)
- ✅ **Propone alternativas** cuando la primera opción no es óptima

## 🎯 **Ejemplo de diferencia:**

### Antes (simulado):
```
"reasoning": "[Modo básico] Slot requerido necesita contenido"
```

### Ahora (IA real):
```
"reasoning": "Para una introducción de matemáticas, un texto explicativo inicial ayuda a establecer el contexto antes de mostrar elementos visuales complejos. El contenido textual es óptimo para dispositivos móviles y permite a los estudiantes leer a su ritmo."
```

## 🔄 **Sistema de Fallback**

Si Ollama no está disponible, el sistema automáticamente usa el algoritmo de respaldo basado en reglas, así que **la app siempre funciona**.

La IA se indica con:
- 🤖 **"IA Activa"** - Llama 3 funcionando
- 💤 **"IA Desactivada"** - Usando fallback

---

¡Ahora tienes IA **real** generando recomendaciones pedagógicas inteligentes! 🎉 