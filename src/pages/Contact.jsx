import Seo from "../components/Seo";
import ContactSection from "../sections/ContactSection";

const Contact = () => (
   <>
      <Seo page="contact" path="/contact" />
      <ContactSection heading={false} />
   </>
);

export default Contact;
