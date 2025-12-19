import { Metadata } from 'next';
import NosotrosCTASection from '@/components/sections/NosotrosCTASection';

// Metadata para SEO
export const metadata: Metadata = {
  title: 'Política de Privacidad | Playful Agency',
  description: 'Conoce cómo protegemos tu información personal en Playful Agency. Política de privacidad actualizada.',
};

export default function PoliticaDePrivacidad() {
  return (
    <main className="min-h-screen bg-[#E9D7FF] bg-[url('/images/background.webp')] bg-cover bg-center">
      {/* Hero Section - Sección principal con dos columnas según el diseño */}
      <section className="w-[calc(100%-80px)] max-w-[1200px] mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Columna izquierda: textos */}
          <div className="flex flex-col justify-center items-start text-left">
              {/* Breadcrumb */}
              <nav className="mb-6 text-sm" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-[#4A4453]">
                  <li>
                    <a href="/" className="hover:text-[#440099] transition-colors">
                      Home
                    </a>
                  </li>
                  <li>
                    <span className="mx-2">&gt;</span>
                  </li>
                  <li>
                    <span className="text-[#440099] font-medium">Política de Privacidad</span>
                  </li>
                </ol>
              </nav>

            <h1 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-normal text-[20px] text-[#453A53] mb-2">Playful Agency</h1>
            <h2 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[45px] leading-[52px] text-[#440099] mb-2">Protegemos tu Identidad: Seguridad y Confianza para Tus Datos</h2>
            <p className="[font-family:var(--font-dm-sans),sans-serif] font-normal text-[16px] leading-[24px] text-[#4A4453] max-w-[600px] mb-4">
                Tu privacidad y la seguridad de tus datos son una prioridad para nosotros. En esta sección, te ofrecemos información clara y detallada sobre nuestras prácticas de manejo de datos, seguridad y tus derechos como usuario. <strong className="font-bold">Nuestro compromiso es generar confianza</strong> en cada interacción.
              </p>
            <p className="[font-family:var(--font-dm-sans),sans-serif] font-normal text-[14px] text-[#4A4453] opacity-80">
              Última actualización: 17 de octubre de 2024
            </p>
          </div>

          {/* Columna derecha: ilustración */}
          <div className="flex justify-center items-center">
            <img 
              src="/images/Politica-images/Playful-politica-privacidad.png" 
              alt="Ilustración de persona leyendo política de privacidad" 
              className="w-full max-w-[500px] h-auto object-contain" 
            />
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative overflow-hidden rounded-3xl p-8 md:p-12 w-[calc(100%-40px)] max-w-[1200px] mx-auto mt-0 mb-16">
        <div className="pointer-events-none absolute inset-0 bg-white" />
        <div className="relative z-10 w-full max-w-[1180px] mx-auto bg-[#F7EDFF] rounded-[36px] p-8 md:p-10">
          {/* Contenido de política de privacidad */}
          <div className="space-y-8 [font-family:var(--font-dm-sans),sans-serif] text-[#453A53]">
            
            <p className="text-[16px] leading-[26px]">
              De conformidad con normativa europea de protección de datos comprendida en el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo de 27 de abril de 2016 relativo a la protección de las personas físicas (en adelante, RGPD) y según la normativa española, Ley Orgánica 3/2018 de Protección de Datos y Garantía de Derechos Digitales (en adelante, LOPDGDD), este apartado tiene como finalidad explicar nuestra Política de Privacidad y detallar la información relativa al tratamiento de los datos personales que efectuamos, así como informar sobre los derechos que pueden ejercer los Usuarios para mantener el control sobre sus datos, para dar cumplimiento con el deber de información que exige la legislación referenciada.
            </p>

            <div>
              <h3 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[24px] leading-[32px] text-[#440099] mb-4">
                Identificación del responsable del tratamiento de datos personales
              </h3>
              <p className="text-[16px] leading-[26px] mb-3">
                El titular, operador de la página web y responsable del tratamiento de datos es:
              </p>
              <p className="text-[16px] leading-[26px] mb-2"><strong>Razón social:</strong> PLAYFUL AGENCY NETWORK LLC</p>
              <p className="text-[16px] leading-[26px] mb-2"><strong>Domicilio fiscal:</strong> 55 SE 6 STREET UNIT 1506. MIAMI, FL 33131. UNITED STATES.</p>
              <p className="text-[16px] leading-[26px] mb-2"><strong>Teléfono:</strong> +1 (786) 305-8421</p>
              <p className="text-[16px] leading-[26px]"><strong>Correo electrónico:</strong> hello@playfulagency.com</p>
            </div>

            <div>
              <h3 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[24px] leading-[32px] text-[#440099] mb-4">
                ¿Cómo y por qué tratamos tus datos personales?
              </h3>
              <p className="text-[16px] leading-[26px] mb-4">
                Como Usuario puedes navegar por nuestro Sitio Web sin necesidad de proporcionar datos personales. No obstante, los datos de carácter personal que se pudieran recabar directamente de ti, a través de formularios o por tu cesión voluntaria, serán tratados de forma confidencial y especificada en esta Política de Privacidad, quedando incorporados a nuestro correspondiente registro de actividad de tratamiento.
              </p>
              <p className="text-[16px] leading-[26px] mb-4">
                Los datos recabados siempre serán con tu consentimiento y se almacenarán durante el período estrictamente necesario para cumplir los fines anteriormente descritos y en relación con cada tipo de tratamiento.
              </p>
              <p className="text-[16px] leading-[26px] mb-6">
                A continuación, detallamos cómo tratamos tus datos en función del contexto y la finalidad de los datos recabados:
              </p>

              <div className="space-y-4 bg-#F7EDFF rounded-2xl p-6">
                <p className="text-[15px] leading-[24px]"><strong>FINALIDAD DEL TRATAMIENTO:</strong> Gestionar cualquier tipo de solicitud, sugerencia o petición. Contactar con el remitente de la información, dar respuesta a su solicitud, petición o consulta y hacer un seguimiento posterior.</p>
                <p className="text-[15px] leading-[24px]"><strong>FUENTE DE LEGITIMIDAD (BASE LEGAL):</strong> Consentimiento de los interesados. Interés legítimo para atender a los requerimientos de información a través de los canales de comunicación.</p>
                <p className="text-[15px] leading-[24px]"><strong>DESTINATARIOS:</strong> No se prevé la cesión de datos a terceros, excepto obligación legal.</p>
                <p className="text-[15px] leading-[24px]"><strong>PLAZO DE CONSERVACIÓN:</strong> Hasta la resolución de su solicitud de información o mientras perdure la relación comercial.</p>
              </div>

              <div className="space-y-4 bg-[#F7EDFF] rounded-2xl p-6">
                <p className="text-[15px] leading-[24px]"><strong>FINALIDAD DEL TRATAMIENTO:</strong> Gestionar y controlar la cartera de clientes, pre-clientes y proveedores</p>
                <p className="text-[15px] leading-[24px]"><strong>FUENTE DE LEGITIMIDAD (BASE LEGAL):</strong> Relación contractual para la ejecución de un contrato.</p>
                <p className="text-[15px] leading-[24px]"><strong>DESTINATARIOS:</strong> No se prevé la cesión de datos a terceros, excepto obligación legal o de la ejecución del propio contrato de prestación de servicios.</p>
                <p className="text-[15px] leading-[24px]"><strong>PLAZO DE CONSERVACIÓN:</strong> Mientras perdure la relación contractual para la ejecución de un contrato.</p>
              </div>

              <div className="space-y-4 bg-[#F7EDFF] rounded-2xl p-6">
                <p className="text-[15px] leading-[24px]"><strong>FINALIDAD DEL TRATAMIENTO:</strong> Prestación de servicios y comercialización de productos: Ofrecer servicios, productos y actividades para que podamos cotizar, prestar, gestionar y ejecutar los servicios</p>
                <p className="text-[15px] leading-[24px]"><strong>FUENTE DE LEGITIMIDAD (BASE LEGAL):</strong> Consentimiento de los interesados. Interés legítimo para atender a los requerimientos de información a través de los canales de comunicación.</p>
                <p className="text-[15px] leading-[24px]"><strong>DESTINATARIOS:</strong> No se prevé la cesión de datos a terceros, excepto obligación legal o de la ejecución del propio contrato de prestación de servicios.</p>
                <p className="text-[15px] leading-[24px]"><strong>PLAZO DE CONSERVACIÓN:</strong> Hasta la resolución de su solicitud de información o mientras perdure la relación comercial.</p>
              </div>

              <div className="space-y-4 bg-[#F7EDFF] rounded-2xl p-6">
                <p className="text-[15px] leading-[24px]"><strong>FINALIDAD DEL TRATAMIENTO:</strong> Comunicaciones comerciales. Remisión de comunicaciones promocionales vía electrónica y de newsletters. Informar sobre actividades, artículos de interés, e-books e información general sobre nuestros servicios vía correo electrónico (e-mail, SMS, Whatsapp), así como por vía telefónica.</p>
                <p className="text-[15px] leading-[24px]"><strong>FUENTE DE LEGITIMIDAD (BASE LEGAL):</strong> Consentimiento del interesado e interés legítimo.</p>
                <p className="text-[15px] leading-[24px]"><strong>DESTINATARIOS:</strong> Prestadores de servicios de mailing y colaboradores dentro y fuera de la Unión Europea que nos dan soporte en el envío de las comunicaciones.</p>
                <p className="text-[15px] leading-[24px]"><strong>PLAZO DE CONSERVACIÓN:</strong> Se conservarán durante el tiempo necesario para cumplir con la finalidad para la que se recabaron o hasta que el usurario revoque su consentimiento.</p>
              </div>

              <div className="space-y-4 bg-[#F7EDFF] rounded-2xl p-6">
                <p className="text-[15px] leading-[24px]"><strong>FINALIDAD DEL TRATAMIENTO:</strong> Gestión del ejercicio de los derechos de los Usuarios.</p>
                <p className="text-[15px] leading-[24px]"><strong>FUENTE DE LEGITIMIDAD (BASE LEGAL):</strong> Obligación legal del responsable.</p>
                <p className="text-[15px] leading-[24px]"><strong>DESTINATARIOS:</strong> No se ceden datos a terceros, salvo obligación legal.</p>
                <p className="text-[15px] leading-[24px]"><strong>PLAZO DE CONSERVACIÓN:</strong> Durante el tiempo necesario para respuesta y para dar cumplimiento a los plazos legales previstos para atender eventuales responsabilidades.</p>
              </div>

              <div className="space-y-4 bg-[#F7EDFF] rounded-2xl p-6">
                <p className="text-[15px] leading-[24px]"><strong>FINALIDAD DEL TRATAMIENTO:</strong> Gestión fiscal, contable, mercantil y jurídico</p>
                <p className="text-[15px] leading-[24px]"><strong>FUENTE DE LEGITIMIDAD (BASE LEGAL):</strong> Obligación legal del responsable.</p>
                <p className="text-[15px] leading-[24px]"><strong>DESTINATARIOS:</strong> Se ceden a encargados de tratamiento bajo contrato para efectuar la prestación de servicios.</p>
                <p className="text-[15px] leading-[24px]"><strong>PLAZO DE CONSERVACIÓN:</strong> Durante el tiempo necesario para respuesta y para dar cumplimiento a los plazos legales previstos para atender eventuales responsabilidades.</p>
              </div>
            </div>

            <div>
              <h3 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[24px] leading-[32px] text-[#440099] mb-4">
                ¿Cómo obtenemos tus datos personales?
              </h3>
              <p className="text-[16px] leading-[26px] mb-4">
                Los datos personales que tratamos se recogen a través de la información que tú mismo nos facilitas directamente, ya sea a través de cualquier formulario y/o de los medios que ponemos a su disposición en nuestro Sitio Web, o bien, a través del contrato de prestación de servicios o de Encargado del Tratamiento.
              </p>
              <p className="text-[16px] leading-[26px] mb-4">
                Al cumplimentar cualquier formulario disponible en nuestro Sitio Web, nos das tu consentimiento para: (i) el tratamiento de tus datos personales con los fines mencionados anteriormente; (ii) recibir comunicaciones y boletines sobre noticias y ofertas de Servicios; (iii) atender tus consultes y solicitudes.
              </p>
              <p className="text-[16px] leading-[26px] mb-3">
                Las categorías de datos que gestionamos son:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[16px] leading-[26px] mb-4">
                <li>Datos identificativos (nombre y, en su caso, apellidos)</li>
                <li>Dirección de correo electrónico y/o teléfono (dependiendo del medio utilizado)</li>
                <li>Dirección postal</li>
                <li>Información comercial</li>
                <li>Datos económicos</li>
              </ul>
              <p className="text-[16px] leading-[26px]">
                Así como cualquier otro dato que incluyas en las comunicaciones que nos remitas. No se tratan datos especialmente protegidos.
              </p>
            </div>

            <div>
              <h3 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[24px] leading-[32px] text-[#440099] mb-4">
                Información necesaria, actualizada y veracidad de los datos
              </h3>
              <p className="text-[16px] leading-[26px] mb-4">
                Cuando nos proporcionas tus datos para utilizar nuestros servicios, garantizas dicha información facilitada, es real, veraz, actualizada y de tu pertenencia.
              </p>
              <p className="text-[16px] leading-[26px]">
                Para que la información facilitada esté siempre actualizada y no contenga errores, rogamos que nos notifiquéis cualquier rectificación o modificación que se produzca en relación con los datos facilitados con la mayor brevedad posible, siendo vosotros responsables de la veracidad y exactitud de los datos suministrados en cada momento. Podéis contactar con nosotros a través de la siguiente dirección de un correo electrónico a la dirección: hello@playfulagency.com
              </p>
            </div>

            <div>
              <h3 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[24px] leading-[32px] text-[#440099] mb-4">
                ¿Cuáles son tus derechos sobre el tratamiento que se realiza de tus datos?
              </h3>
              <p className="text-[16px] leading-[26px] mb-4">
                Cualquier persona tiene derecho a obtener confirmación sobre si se está tratando sus datos personales. Las personas interesadas tienen derecho a acceder a sus datos personales, así como a solicitar la rectificación de los datos inexactos o, en su caso, solicitar su supresión cuando, entre otros motivos, los datos ya no sean necesarios para los fines para los que fueron recogidos.
              </p>
              <p className="text-[16px] leading-[26px] mb-6">
                Los derechos que te asisten y que tienes reconocidos en la normativa vigente son los siguientes:
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6">
                  <h4 className="font-bold text-[18px] text-[#440099] mb-3">Derecho de acceso</h4>
                  <p className="text-[15px] leading-[24px]">
                    Tienes derecho a obtener de nosotros: a) la confirmación de si estamos o no utilizando tus datos personales y, en su caso, acceder a dichos datos; b) obtener información detallada sobre determinados aspectos del tratamiento que se está llevando a cabo; c) obtener una copia de tus datos personales objeto de tratamiento.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6">
                  <h4 className="font-bold text-[18px] text-[#440099] mb-3">Derecho a la rectificación</h4>
                  <p className="text-[15px] leading-[24px]">
                    Tienes derecho a obtener: a) la rectificación de tus datos personales inexactos; b) a que se completen aquellos que fueran incompletos o inexactos.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6">
                  <h4 className="font-bold text-[18px] text-[#440099] mb-3">Derecho a la supresión (derecho al "olvido")</h4>
                  <p className="text-[15px] leading-[24px]">
                    Te permite solicitar la supresión o eliminación de tus datos personales cuando no haya un motivo para seguir utilizándolo, en todo caso, la supresión estará sujeto a los límites establecidos en la norma reguladora.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6">
                  <h4 className="font-bold text-[18px] text-[#440099] mb-3">Derecho a limitación al tratamiento</h4>
                  <p className="text-[15px] leading-[24px]">
                    Tienes derecho a solicitar la limitación en cuanto al tratamiento de tus datos de carácter personal, en cuyo caso únicamente los conservaremos para el ejercicio o la defensa de reclamaciones. Tienes derecho a «bloquear» o suprimir el uso posterior de tus datos personales.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6">
                  <h4 className="font-bold text-[18px] text-[#440099] mb-3">Derecho a la portabilidad de datos</h4>
                  <p className="text-[15px] leading-[24px]">
                    Tienes derecho a disponer de tus datos personales, en un formato estructurado, de uso común y lectura mecánica y para transmitir a otro responsable del tratamiento, cuando: (i) el tratamiento esté basado en el consentimiento otorgado previamente; y, (ii) el tratamiento se efectúe por medios automatizados.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6">
                  <h4 className="font-bold text-[18px] text-[#440099] mb-3">Derecho a oponerse al procesamiento</h4>
                  <p className="text-[15px] leading-[24px]">
                    Por motivos relacionados con tu situación particular, tienes derecho a oponerte al tratamiento de tus datos con fines de mercadotecnia directa (marketing directo) y a no ser objeto de una decisión basada únicamente en el tratamiento automatizado, incluida la elaboración de perfiles. En dicho caso, dejaremos de tratar los datos, excepto por motivos legítimos, imperiosos, o el ejercicio o la defensa de posibles reclamos.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6">
                  <h4 className="font-bold text-[18px] text-[#440099] mb-3">Derecho a retirar el consentimiento</h4>
                  <p className="text-[15px] leading-[24px]">
                    En caso de que hayas otorgado tú consentimiento para el tratamiento de datos personales, tienes derecho a retirarlo en cualquier momento.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[24px] leading-[32px] text-[#440099] mb-4">
                ¿Cómo puedes ejercer tus derechos?
              </h3>
              <p className="text-[16px] leading-[26px] mb-4">
                Como parte afectada en la gestión de datos personales, puedes ejercer los derechos citados en cualquier momento digiriéndote a nosotros, como responsable del tratamiento, a través del siguiente correo electrónico: hello@playfulagency.com, estableciendo en el "Asunto" el derecho ejercitado, o bien, presentando un escrito, junto con tu acreditación de identidad, a la dirección postal: MIAMI, FL 33131. UNITED STATES.
              </p>
              <p className="text-[16px] leading-[26px]">
                Puedes obtener más información sobre tus derechos mediante la Guía para el Ciudadano publicada por la AEPD, que encontrarás en el siguiente enlace: <a href="https://www.aepd.es/sites/default/files/2020-05/guia-ciudadano.pdf" target="_blank" rel="noopener noreferrer" className="text-[#440099] underline hover:text-[#330077]">https://www.aepd.es/sites/default/files/2020-05/guia-ciudadano.pdf</a>
              </p>
            </div>

            <div>
              <h3 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[24px] leading-[32px] text-[#440099] mb-4">
                ¿Cómo protegemos tus datos?
              </h3>
              <h4 className="font-semibold text-[18px] mb-3">Medidas de seguridad</h4>
              <p className="text-[16px] leading-[26px]">
                Los datos de nuestros clientes y proveedores son un activo muy importante para nosotros, por ello, hemos adoptado los niveles de seguridad legalmente requeridos, y velamos por implantar e instalar todos los medios y medidas técnicas adicionales a nuestro alcance para evitar la pérdida, mal uso, alteración, acceso no autorizado y robo de los datos personales que nos hayas podido facilitar.
              </p>
            </div>

            <div>
              <h3 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[24px] leading-[32px] text-[#440099] mb-4">
                Cesiones de datos, servicios de terceros y transferencias internacionales de datos
              </h3>
              <p className="text-[16px] leading-[26px] mb-4">
                Contratamos a terceros proveedores de servicios para que nos brinden una variedad de servicios y funciones, como alojamiento de servidores web, mantenimiento del sistema, soporte técnico y comunicaciones de marketing. Podemos compartir los datos personales con nuestros proveedores de servicios con sujeción a las obligaciones de confidencialidad consistentes con esta Política y con la condición de que los proveedores de servicios utilicen sus datos personales solo en nuestro nombre y de conformidad con nuestras instrucciones.
              </p>
              <p className="text-[16px] leading-[26px]">
                Asimismo, en el transcurso del procesamiento de tus datos personales, estos pueden transferirse o transmitirse fuera de su país de origen, por ejemplo, a los Estados Unidos. Estas transferencias respaldan las acciones y finalidades de procesamiento de los datos personales descritos anteriormente. Cuando transferimos datos personales a otros países, buscamos socios de máxima confianza y establecemos las garantías adecuadas (como contratos de encargado de tratamientos, acuerdos de transmisión internacional o cláusulas) de acuerdo con requisitos legales pertinentes y de conformidad con los estándares de la autoridad local de protección de datos.
              </p>
            </div>

            <div>
              <h3 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[24px] leading-[32px] text-[#440099] mb-4">
                Navegación del sitio web y política de cookies
              </h3>
              <p className="text-[16px] leading-[26px]">
                Este Sitio Web puede hacer uso de Cookies con finalidades analíticas, estadísticas y publicitarias. En dicho caso, se advertirá a los Usuarios para recabar el oportuno consentimiento y se ofrecerá las herramientas de gestión para restringir o aplicar el uso de las Cookies. En ningún caso las cookies u otros medios de naturaleza análoga servirán para almacenar información que permita identificar la persona física usuaria del Sitio Web.
              </p>
            </div>

            <div>
              <h3 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[24px] leading-[32px] text-[#440099] mb-4">
                Contenidos integrados y enlaces a terceros
              </h3>
              <p className="text-[16px] leading-[26px] mb-4">
                Nuestro Sitio Web puede proporcionar enlaces a otros sitios web, pero no asumimos la responsabilidad, directa ni indirectamente, sobre las políticas de privacidad adoptadas por las páginas vinculadas. Los enlaces a otros sitios web se brindan solo como sugerencia y no implican la garantía o responsabilidad nuestra con respecto a la calidad, exactitud o contenido de la información en ellos proporcionada.
              </p>
              <p className="text-[16px] leading-[26px]">
                Además, algunos de nuestros servicios llevan contenido integrado controlado por terceros que se utiliza para compartir información a través de las redes sociales o para que se puedan visualizar videos o imágenes. Cuando interactúas con estos servicios, es posible que recopilen información sobre ti y sobre tu interacción con su contenido. Esta actividad estará sujeta a la política de privacidad y a la configuración de la red o servicio del tercero en cuestión. Ten en cuenta que podrían rastrear tu actividad, mediante el uso de cookies o tecnología similares de seguimiento, sin necesidad de que tú interactúes con ellos. Si esto te preocupa, asegúrate de cerrar la sesión antes de usar el nuestro Sitio Web y lee con detenimiento nuestra Política de Cookies.
              </p>
            </div>

            <div>
              <h3 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[24px] leading-[32px] text-[#440099] mb-4">
                Modificación de la Política de Privacidad
              </h3>
              <p className="text-[16px] leading-[26px]">
                Nos reservamos el derecho a modificar nuestra política de tratamiento de datos en cualquier momento y sin necesidad de aviso previo. La modificación de esta Política de Privacidad estará disponible para los usuarios y será de aplicación desde el momento de su publicación en el Sitio Web. Siempre que sea necesario un nuevo consentimiento, se recogerá adecuadamente.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <NosotrosCTASection />
    </main>
  );
}
