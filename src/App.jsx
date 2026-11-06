import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { routes } from "./routes/AppRoutes";

const router = createBrowserRouter(routes);

function App() {
   return (
      <MotionConfig reducedMotion="user">
         <RouterProvider router={router} />
      </MotionConfig>
   );
}

export default App;
