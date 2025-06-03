import { BrowserRouter } from "react-router-dom";
import { Provider } from "./core/application/Provider";
import { AppRoutes } from "./routes";

function App() {
  return (
    <BrowserRouter>
      <Provider>
      <div className="pb-16">
        <AppRoutes />
        </div>
      </Provider>
    </BrowserRouter>
  );
}

export default App;