import { Button, Empty } from "../ui";

const Missing = () => (
   <Empty title="Cette page n'existe pas" text="L'élément a peut-être été supprimé.">
      <Button to="/admin">Retour à l&apos;accueil</Button>
   </Empty>
);

export default Missing;
