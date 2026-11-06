import Seo from "../components/Seo";
import ServicesSection from "../sections/ServicesSection";
import ContactSection from "../sections/ContactSection";

const Services = () => (
   <>
      <Seo page="services" path="/services" />
      <ServicesSection heading={false} />
      <ContactSection />
   </>
);

export default Services;
