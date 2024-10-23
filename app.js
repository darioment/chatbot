const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MySQLAdapter = require('@bot-whatsapp/database/mysql')

const { appendToSheet, readSheet } = require("./utils")

/**
 * Declaramos las conexiones de MySQL
 */
const MYSQL_DB_HOST = 'localhost'
const MYSQL_DB_USER = 'facturas'
const MYSQL_DB_PASSWORD = 'myFACT.'
const MYSQL_DB_NAME = 'facturas'
const MYSQL_DB_PORT = '3306'

/**
 * Aqui declaramos los flujos hijos, los flujos se declaran de atras para adelante, es decir que si tienes un flujo de este tipo:
 *
 *          Menu Principal
 *           - SubMenu 1
 *             - Submenu 1.1
 *           - Submenu 2
 *             - Submenu 2.1
 *
 * Primero declaras los submenus 1.1 y 2.1, luego el 1 y 2 y al final el principal.
 */
const flowHistorial = addKeyword(['historial'])
.addAnswer('🙌 claro, aquuí lo tienes:'
    ,null
    ,async(ctx,ctxFn) => {
        await ctxFn.state.update({nombre:ctx.body})
        const response = await readSheet("facbot!A1:J10")
            console.log(response)
    }
)

const flowPrincipal = addKeyword(['factura'])
.addAnswer('🙌 Hola bienvenido a la facturación, me puedes proporcionar por favor Nombre denominación o razón social de la persona a favor de quien se expide el comprobante?'
    ,{capture:true}
    ,async(ctx,ctxFn) => {
        await ctxFn.state.update({nombre:ctx.body})
    }
)

.addAnswer('Cuál es el Régimen fiscal del receptor de comprobante?'
    ,{capture:true}
    ,async(ctx,ctxFn) => {
        await ctxFn.state.update({regimen:ctx.body})
    }
)

.addAnswer('Cuál es el Código postal del domicilio fiscal del receptor del comprobante?'
    ,{capture:true}
    ,async(ctx,ctxFn) => {
        await ctxFn.state.update({codigop:ctx.body})
    }
)

.addAnswer('Cuál es el Uso del comprobante?'
    ,{capture:true}
    ,async(ctx,ctxFn) => {
        await ctxFn.state.update({uso:ctx.body})
    }
)

.addAnswer('Cuál es la Cantidad, unidad de medida y clase de los bienes, mercancías o descripción del servicio o del uso o goce que amparen?'
    ,{capture:true}
    ,async(ctx,ctxFn) => {
        await ctxFn.state.update({cantidad:ctx.body})
    }
)

.addAnswer('Cuál es el Valor unitario consignado en número?'
    ,{capture:true}
    ,async(ctx,ctxFn) => {
        await ctxFn.state.update({valor:ctx.body})
    }
)

.addAnswer('Cuál es el Importe total señalado en número o en letra?'
    ,{capture:true}
    ,async(ctx,ctxFn) => {
        await ctxFn.state.update({importe:ctx.body})
    }
)

.addAnswer('Cuál es el Señalamiento expreso cuando la prestación se pague en una sola exhibición o en parcialidades?'
    ,{capture:true}
    ,async(ctx,ctxFn) => {
        await ctxFn.state.update({parcialidades:ctx.body})
    }
)

.addAnswer('Cuando proceda, se indicará el monto de los impuestos trasladados, desglosados por tasa de impuesto y, en su caso, el monto de los impuestos retenidos?'
    ,{capture:true}
    ,async(ctx,ctxFn) => {
        await ctxFn.state.update({impuesto:ctx.body})
    }
)

.addAnswer('Forma en que se realizó el pago (efectivo, transferencia electrónica de fondos, cheque nominativos o tarjeta de débito, de crédito, de servicio o la denominada monedero electrónico que autorice el Servicio de Administración Tributaria)?'
    ,{capture:true}
    ,async(ctx,ctxFn) => {
        await ctxFn.state.update({formapago:ctx.body})
    }
)

.addAnswer('Gracias, tu factura se está procesando, en breve recibiras un correo con tu factura.'
    , null
    , async (ctx, ctxFn) => {
        const nombre = ctxFn.state.get("nombre")
        const regimen = ctxFn.state.get("regimen")
        const codigop = ctxFn.state.get("codigop")
        const uso = ctxFn.state.get("uso")
        const cantidad = ctxFn.state.get("cantidad")
        const valor = ctxFn.state.get("valor")
        const importe = ctxFn.state.get("importe")
        const parcialidades = ctxFn.state.get("parcialidades")
        const impuesto = ctxFn.state.get("impuesto")
        const formapago = ctxFn.state.get("formapago")
        await appendToSheet([nombre,regimen,codigop,uso,cantidad,valor,importe,parcialidades,impuesto,formapago])        
    }
)


const main = async () => {
    const adapterDB = new MySQLAdapter({
        host: MYSQL_DB_HOST,
        user: MYSQL_DB_USER,
        database: MYSQL_DB_NAME,
        password: MYSQL_DB_PASSWORD,
        port: MYSQL_DB_PORT,
    })
    const adapterFlow = createFlow([flowPrincipal, flowHistorial])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()
