import { BrowserRouter as Router, Routes, Route } from "react-router";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/AuthPages/Login";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Dashboard from "./pages/Dashboard";
import ResidentForm from "./pages/Resident/ResidentForm";
import ResidentList from "./pages/Resident/ResidentList";
import HouseList from "./pages/House/HouseList";
import HouseForm from "./pages/House/HouseForm";
import ExpenseList from "./pages/Expense/ExpenseList";
import ExpenseForm from "./pages/Expense/ExpenseForm";
import PaymentList from "./pages/Payment/PaymentList";
import PaymentForm from "./pages/Payment/PaymentForm";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Auth Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route element={<PrivateRoute />}>
            {/* Dashboard Layout */}
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Dashboard />} />

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />

              {/* Warga */}
              <Route path="/tabel-warga" element={<ResidentList />} />
              <Route path="/form-warga" element={<ResidentForm />} />

              {/* Rumah */}
              <Route path="/tabel-rumah" element={<HouseList />} />
              <Route path="/form-Rumah" element={<HouseForm />} />

              {/* Pengeluaran */}
              <Route path="/tabel-pengeluaran" element={<ExpenseList />} />
              <Route path="/form-pengeluaran" element={<ExpenseForm />} />

              {/* Pmbayaran */}
              <Route path="/tabel-pembayaran" element={<PaymentList />} />
              <Route path="/form-pembayaran" element={<PaymentForm />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>
          </Route>
          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
