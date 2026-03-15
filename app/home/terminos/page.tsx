import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { LogoFull } from "@/components/brand/logo"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terminos y Condiciones - Bio Link Store",
  description: "Terminos de uso, politica de privacidad y politica de reembolso de Bio Link Store.",
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen gradient-background text-foreground">
      <header className="border-b border-white/10 glass-panel">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/home">
            <LogoFull iconSize={40} />
          </Link>
          <Link
            href="/home"
            className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Terminos y Condiciones</h1>
        <p className="text-white/60 mb-12">Ultima actualizacion: 15 de marzo de 2026</p>

        {/* Términos de Uso */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">1. Terminos de Uso</h2>

          <div className="space-y-4 text-white/80 leading-relaxed">
            <h3 className="text-lg font-medium text-white">1.1 Aceptacion de los Terminos</h3>
            <p>
              Al acceder y utilizar Bio Link Store (&quot;la Plataforma&quot;), operada por Bio Link Store
              (&quot;nosotros&quot;, &quot;nuestro&quot;), usted acepta cumplir y estar sujeto a estos Terminos y
              Condiciones. Si no esta de acuerdo con alguna parte de estos terminos, no debe utilizar la Plataforma.
            </p>

            <h3 className="text-lg font-medium text-white">1.2 Descripcion del Servicio</h3>
            <p>
              Bio Link Store es una plataforma SaaS (Software como Servicio) que permite a los vendedores de
              Instagram crear catalogos web para sus productos. Los clientes finales pueden explorar los productos
              y enviar solicitudes de pedido a traves de WhatsApp. La Plataforma actua unicamente como
              intermediario tecnologico y no participa en las transacciones comerciales entre vendedores y
              compradores.
            </p>

            <h3 className="text-lg font-medium text-white">1.3 Elegibilidad</h3>
            <p>
              Para utilizar la Plataforma, usted debe ser mayor de 18 anos o contar con el consentimiento de un
              tutor legal. Al registrarse, usted declara que la informacion proporcionada es veraz y completa.
            </p>

            <h3 className="text-lg font-medium text-white">1.4 Cuentas de Usuario</h3>
            <p>
              Usted es responsable de mantener la confidencialidad de su cuenta y contrasena. Cualquier actividad
              realizada bajo su cuenta es su responsabilidad. Debe notificarnos inmediatamente si sospecha de
              un uso no autorizado de su cuenta.
            </p>

            <h3 className="text-lg font-medium text-white">1.5 Uso Aceptable</h3>
            <p>Al utilizar la Plataforma, usted se compromete a:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>No publicar contenido ilegal, ofensivo, difamatorio o que viole derechos de terceros</li>
              <li>No utilizar la Plataforma para vender productos prohibidos por la ley</li>
              <li>No intentar acceder a sistemas o datos sin autorizacion</li>
              <li>No enviar spam, malware o contenido danino</li>
              <li>No suplantar la identidad de otra persona o entidad</li>
              <li>Cumplir con todas las leyes y regulaciones aplicables en su jurisdiccion</li>
            </ul>

            <h3 className="text-lg font-medium text-white">1.6 Propiedad Intelectual</h3>
            <p>
              Todo el contenido de la Plataforma, incluyendo pero no limitado a disenos, logotipos, textos,
              graficos y software, es propiedad de Bio Link Store y esta protegido por las leyes de propiedad
              intelectual. Los usuarios conservan la propiedad de su contenido, pero otorgan a Bio Link Store
              una licencia limitada para mostrar dicho contenido en la Plataforma.
            </p>

            <h3 className="text-lg font-medium text-white">1.7 Planes y Suscripciones</h3>
            <p>
              La Plataforma ofrece distintos planes de suscripcion (Gratis, Pro, Business) con diferentes
              funcionalidades. Los precios y caracteristicas de cada plan estan disponibles en nuestra pagina de
              precios y pueden ser actualizados con previo aviso.
            </p>

            <h3 className="text-lg font-medium text-white">1.8 Limitacion de Responsabilidad</h3>
            <p>
              Bio Link Store no se responsabiliza por las transacciones entre vendedores y compradores. La
              Plataforma se proporciona &quot;tal cual&quot; y &quot;segun disponibilidad&quot;. No garantizamos que el servicio
              sea ininterrumpido, seguro o libre de errores. En la medida permitida por la ley, nuestra
              responsabilidad total no excedera el monto pagado por usted en los ultimos 12 meses.
            </p>

            <h3 className="text-lg font-medium text-white">1.9 Terminacion</h3>
            <p>
              Nos reservamos el derecho de suspender o cancelar su cuenta si viola estos terminos. Usted puede
              cancelar su cuenta en cualquier momento desde la configuracion de su panel de control.
            </p>

            <h3 className="text-lg font-medium text-white">1.10 Modificaciones</h3>
            <p>
              Nos reservamos el derecho de modificar estos terminos en cualquier momento. Los cambios seran
              efectivos al ser publicados en esta pagina. El uso continuado de la Plataforma despues de los
              cambios constituye su aceptacion de los mismos.
            </p>
          </div>
        </section>

        {/* Política de Privacidad */}
        <section className="mb-12">
          <h2 id="privacidad" className="text-2xl font-semibold text-white mb-6 scroll-mt-8">2. Politica de Privacidad</h2>

          <div className="space-y-4 text-white/80 leading-relaxed">
            <h3 className="text-lg font-medium text-white">2.1 Informacion que Recopilamos</h3>
            <p>Recopilamos los siguientes tipos de informacion:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>Informacion de registro:</strong> nombre, correo electronico y contrasena al crear su cuenta
              </li>
              <li>
                <strong>Informacion de la tienda:</strong> nombre de la tienda, descripcion, productos, imagenes
                y precios que usted publica
              </li>
              <li>
                <strong>Datos de uso:</strong> paginas visitadas, funciones utilizadas, frecuencia de acceso y
                datos de rendimiento
              </li>
              <li>
                <strong>Informacion del dispositivo:</strong> tipo de navegador, sistema operativo, direccion IP
                y datos de cookies
              </li>
              <li>
                <strong>Informacion de pago:</strong> los datos de pago son procesados de forma segura por
                nuestros proveedores de pago (como Stripe) y nosotros no almacenamos datos completos de
                tarjetas de credito
              </li>
            </ul>

            <h3 className="text-lg font-medium text-white">2.2 Como Utilizamos su Informacion</h3>
            <p>Utilizamos su informacion para:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Proporcionar, mantener y mejorar la Plataforma</li>
              <li>Procesar transacciones y enviar notificaciones relacionadas</li>
              <li>Enviar comunicaciones de servicio, actualizaciones y soporte</li>
              <li>Analizar el uso de la Plataforma para mejorar la experiencia del usuario</li>
              <li>Prevenir fraudes y garantizar la seguridad de la Plataforma</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>

            <h3 className="text-lg font-medium text-white">2.3 Compartir Informacion</h3>
            <p>No vendemos su informacion personal. Podemos compartirla con:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>Proveedores de servicios:</strong> empresas que nos ayudan a operar la Plataforma
                (alojamiento, analitica, procesamiento de pagos)
              </li>
              <li>
                <strong>Requisitos legales:</strong> cuando sea necesario para cumplir con la ley, una orden
                judicial o un proceso legal
              </li>
              <li>
                <strong>Proteccion de derechos:</strong> para proteger los derechos, propiedad o seguridad de
                Bio Link Store, nuestros usuarios u otros
              </li>
            </ul>

            <h3 className="text-lg font-medium text-white">2.4 Seguridad de los Datos</h3>
            <p>
              Implementamos medidas de seguridad tecnicas y organizativas para proteger su informacion,
              incluyendo cifrado de datos en transito (HTTPS/TLS), almacenamiento seguro de contrasenas mediante
              algoritmos de hash, y acceso restringido a datos personales. Sin embargo, ningun metodo de
              transmision por Internet es 100% seguro.
            </p>

            <h3 className="text-lg font-medium text-white">2.5 Retencion de Datos</h3>
            <p>
              Conservamos su informacion mientras su cuenta este activa o segun sea necesario para proporcionar
              el servicio. Si elimina su cuenta, eliminaremos sus datos personales en un plazo de 30 dias,
              excepto cuando la ley requiera su conservacion.
            </p>

            <h3 className="text-lg font-medium text-white">2.6 Sus Derechos</h3>
            <p>Usted tiene derecho a:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Acceder a la informacion personal que tenemos sobre usted</li>
              <li>Solicitar la correccion de datos inexactos</li>
              <li>Solicitar la eliminacion de sus datos personales</li>
              <li>Oponerse al procesamiento de sus datos</li>
              <li>Solicitar la portabilidad de sus datos</li>
              <li>Retirar su consentimiento en cualquier momento</li>
            </ul>
            <p>
              Para ejercer estos derechos, contactenos a traves de{" "}
              <a href="mailto:soporte@biolinkstore.com" className="text-[#33b380] hover:underline">
                soporte@biolinkstore.com
              </a>.
            </p>

            <h3 className="text-lg font-medium text-white">2.7 Cookies</h3>
            <p>
              Utilizamos cookies y tecnologias similares para mejorar su experiencia, analizar el trafico y
              personalizar el contenido. Puede configurar su navegador para rechazar cookies, aunque esto puede
              afectar la funcionalidad de la Plataforma.
            </p>

            <h3 className="text-lg font-medium text-white">2.8 Servicios de Terceros</h3>
            <p>
              La Plataforma puede contener enlaces a servicios de terceros (como WhatsApp, Instagram). No somos
              responsables de las practicas de privacidad de estos servicios. Le recomendamos revisar sus
              politicas de privacidad.
            </p>
          </div>
        </section>

        {/* Política de Reembolso */}
        <section className="mb-12">
          <h2 id="reembolso" className="text-2xl font-semibold text-white mb-6 scroll-mt-8">3. Politica de Reembolso</h2>

          <div className="space-y-4 text-white/80 leading-relaxed">
            <h3 className="text-lg font-medium text-white">3.1 Suscripciones</h3>
            <p>
              Las suscripciones a planes de pago (Pro, Business) se facturan de forma recurrente segun el
              periodo seleccionado (mensual o anual). Al suscribirse, usted autoriza los cobros recurrentes
              hasta que cancele su suscripcion.
            </p>

            <h3 className="text-lg font-medium text-white">3.2 Periodo de Prueba</h3>
            <p>
              Ofrecemos un plan gratuito que permite a los usuarios probar las funcionalidades basicas de la
              Plataforma sin compromiso. No se requiere tarjeta de credito para el plan gratuito.
            </p>

            <h3 className="text-lg font-medium text-white">3.3 Cancelacion</h3>
            <p>
              Puede cancelar su suscripcion en cualquier momento desde la configuracion de su cuenta. Al
              cancelar:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Su suscripcion permanecera activa hasta el final del periodo de facturacion actual</li>
              <li>No se realizaran cobros adicionales despues del periodo actual</li>
              <li>Su cuenta volvera al plan gratuito con sus limitaciones correspondientes</li>
              <li>Sus datos se conservaran y podra reactivar su plan en cualquier momento</li>
            </ul>

            <h3 className="text-lg font-medium text-white">3.4 Reembolsos</h3>
            <p>Nuestra politica de reembolsos es la siguiente:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>Primeros 14 dias:</strong> si no esta satisfecho con su suscripcion de pago, puede
                solicitar un reembolso completo dentro de los primeros 14 dias desde la fecha de pago.
              </li>
              <li>
                <strong>Despues de 14 dias:</strong> no se emitiran reembolsos parciales ni completos por el
                periodo de facturacion en curso. La cancelacion sera efectiva al final del periodo actual.
              </li>
              <li>
                <strong>Cobros duplicados:</strong> en caso de cobros duplicados o erroneos, emitiremos un
                reembolso completo del monto duplicado en un plazo de 5 a 10 dias habiles.
              </li>
              <li>
                <strong>Interrupciones del servicio:</strong> en caso de interrupciones significativas del
                servicio (mas de 72 horas continuas) atribuibles a nosotros, se evaluara un reembolso
                proporcional o extension del servicio caso por caso.
              </li>
            </ul>

            <h3 className="text-lg font-medium text-white">3.5 Como Solicitar un Reembolso</h3>
            <p>Para solicitar un reembolso:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>
                Envie un correo a{" "}
                <a href="mailto:soporte@biolinkstore.com" className="text-[#33b380] hover:underline">
                  soporte@biolinkstore.com
                </a>{" "}
                con el asunto &quot;Solicitud de reembolso&quot;
              </li>
              <li>Incluya su correo electronico de registro y el motivo de la solicitud</li>
              <li>Nuestro equipo revisara su solicitud en un plazo de 3 dias habiles</li>
              <li>Los reembolsos aprobados se procesaran al metodo de pago original en 5 a 10 dias habiles</li>
            </ol>

            <h3 className="text-lg font-medium text-white">3.6 Transacciones entre Usuarios</h3>
            <p>
              Bio Link Store no procesa pagos entre vendedores y compradores. Las transacciones se realizan
              directamente entre las partes a traves de los medios que el vendedor disponga (WhatsApp,
              transferencia bancaria, etc.). Por lo tanto, Bio Link Store no es responsable de reembolsos
              relacionados con productos o servicios adquiridos a traves de las tiendas creadas en la
              Plataforma. Cualquier disputa debe resolverse directamente entre el vendedor y el comprador.
            </p>
          </div>
        </section>

        {/* Contacto */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">4. Contacto</h2>
          <div className="space-y-4 text-white/80 leading-relaxed">
            <p>
              Si tiene preguntas sobre estos Terminos y Condiciones, Politica de Privacidad o Politica de
              Reembolso, puede contactarnos a traves de:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                Correo electronico:{" "}
                <a href="mailto:soporte@biolinkstore.com" className="text-[#33b380] hover:underline">
                  soporte@biolinkstore.com
                </a>
              </li>
              <li>
                Sitio web:{" "}
                <a href="https://biolinkstore.com" className="text-[#33b380] hover:underline">
                  biolinkstore.com
                </a>
              </li>
            </ul>
          </div>
        </section>

        <div className="border-t border-white/10 pt-8 text-center">
          <Link
            href="/home"
            className="text-[#33b380] hover:underline text-sm"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  )
}
