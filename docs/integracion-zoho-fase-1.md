# Integración Zoho CRM: primera fase

## Objetivo

Conectar el directorio y las fichas de clientes en modo lectura y preparar el análisis de ventas a partir de Parseo. La app actual es un prototipo estático; conectar Zoho en ChatGPT no conecta automáticamente la app.

## Modelo observado en Zoho

- Empresas: módulo `Accounts`. `Account_Name` tiene la etiqueta «Nombre FiscaI»; `Nombre_Fiscal` tiene la etiqueta «Nombre Comercial». Verificar estos nombres por etiqueta y con registros reales antes de intercambiarlos.
- Según Davide, `Accounts` es la base general de empresas y contactos de la empresa. `Contacts` representa el conjunto general de contactos y está relacionado con Accounts mediante `Account_Name`.
- Según Davide, `Clientes` se refiere a clientes activos: los que han comprado en los últimos dos años. En los metadatos observados es un módulo personalizado con nombre, apellido y un lookup `Nombre_de_Cuenta` hacia Accounts. Verificar con ejemplos cómo se actualiza esta clasificación, cómo se relacionan sus registros con Contacts y si el criterio de dos años se calcula automáticamente; no asumirlo.
- Ventas: `Parseo`, lookup `Cliente` hacia Accounts, fecha `Fecha_de_Factura`, número `N_mero_de_Factura`, moneda `Moneda`, proveedor `Nombre_del_Proveedor`, total `Total_de_Factura1`, nota de crédito `Nota_de_credito` y subformulario `Detalle`.
- Detalle: módulo asociado `Detalle`, con `Parent_Id`, `Producto` (lookup Products), `C_digo`, `Modelo_Serie`, `Color`, `Acabado`, `Formato`, `Cantidad` (texto), `UM`, `Precio1` y `Total1`. Normalizar cantidades con validación y conservar el original.
- `Invoices` (Facturas) existe y contiene campos de factura y también campos comerciales por artículo. Su uso real y relación con comisiones y Parseo deben verificarse con ejemplos; no asumir que todos sus registros son de un solo tipo ni sumarlos a Parseo.

## Ficha de cliente: mapeo inicial sujeto a validación

| Campo de ficha | Fuente candidata |
| --- | --- |
| Razón social | Accounts.Account_Name |
| Dirección, ciudad, código y país | Accounts.Billing_Street, Billing_City, Billing_Code, Billing_Country |
| Estado / provincia | Accounts.Estado_de_facturaci_n; Billing_State aparece etiquetado como colonia |
| Identificación fiscal | Accounts.TAX_ID |
| Condiciones de pago | Accounts.Dias_de_Credito, verificar significado |
| Teléfono, contacto principal y contabilidad | Contactos vinculados; falta definir cómo identificar rol principal y contabilidad |

No inventar campos ausentes ni convertir días de crédito en condiciones completas sin verificar. Comparar el PDF generado con el modelo aprobado por Davide.

## Arquitectura propuesta

1. Una capa de servidor autenticada para Zoho, con secretos fuera del navegador y permisos mínimos de lectura. Identificar centro de datos y registrar la aplicación OAuth apropiada; no poner tokens en el repositorio.
2. Crear endpoints internos de búsqueda de cuentas, ficha y contactos, con paginación, errores claros y campos faltantes. Validar el acceso del usuario antes de devolver datos.
3. Mantener Zoho como fuente de verdad. Identificar clientes por ID, no por nombre. Mostrar fecha de actualización si se introduce caché.
4. Para ventas, obtener facturas Parseo y su Detalle, tratar monedas por separado y reconciliar contra ejemplos reales. No aplicar automáticamente el 8 % a todas las marcas: la regla comunicada para el caso tratado excluye DHL y embalajes y debe validarse por proveedor y contrato.
5. Implementar pruebas con datos ficticios y una verificación de lectura limitada de clientes reales. No escribir ni enviar correos en esta fase.

## Primer entregable

- Buscar empresas reales en Accounts y abrir una ficha con los contactos correctamente asociados; distinguir el directorio general de los clientes activos según el criterio de compra en los últimos dos años.
- Generar PDF a partir de campos verificados, manteniendo vacíos los que no existan.
- Probar con Atika y otro cliente, comparando con Zoho y el PDF aprobado.
- Documentar cómo iniciar el proyecto, configurar variables de entorno y revisar cambios mediante pull request.

## Publicación y colaboración

GitHub y el Site publicado son repositorios distintos y no se sincronizan automáticamente. Trabajar en ramas y revisar un pull request hacia main; definir y probar por separado un procedimiento reproducible de sincronización y despliegue antes de publicar. El proyecto exportado contiene la interfaz estática en dist y no incluye el manifiesto de hosting del Site original.
