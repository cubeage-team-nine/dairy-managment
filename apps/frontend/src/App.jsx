import AppRoutes from "./routes/AppRoutes.jsx";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return <>
    <AppRoutes />
    <ToastContainer position="top-right" autoClose={3500} newestOnTop closeOnClick pauseOnHover draggable limit={4} />
  </>;
}

export default App;
