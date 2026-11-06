import { Component, Suspense } from "react";

// Enveloppe un élément secondaire chargé à part (chat, bandeau cookies…) : s'il n'arrive pas,
// sur un réseau instable ou après une mise en ligne, il manque simplement, et la page reste debout.
class QuietBoundary extends Component {
   state = { failed: false };

   static getDerivedStateFromError() {
      return { failed: true };
   }

   render() {
      if (this.state.failed) return null;
      return <Suspense fallback={null}>{this.props.children}</Suspense>;
   }
}

export default QuietBoundary;
