import { useEffect, useState } from "react"
import { Link } from "react-router";
import { useNavigate } from "react-router-dom";
import logo from './assets/logo.png'

function App() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [expenses, setExpenses] = useState([]);
  useEffect(() => {
    (async () => {
      const res = await window.api.getPartners()
      setPartners(res)

      const exp = await window.api.getExpenses()
      setExpenses(exp)
    })()
  }, [])

  const calculateAge = (birthDate) => {
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }

  const getCorrelation = (exp) => {
    if (!exp) {
      return '0'
    }

    return `${(exp.total_expense / exp.salary).toFixed(2)} : ${(exp.salary / exp.total_expense).toFixed(2)}`;
  }

  const getExpenseResult = (exp) => {
    if (!exp) {
      return 'Бюджет в нуле'
    }

    return (exp.salary / exp.total_expense) > 1 ? 'Профицит бюджета' : 'Дефицит бюджета'
  }

  return (
    <>
      <div className="page-heading">
        <img className="page-logo" src={logo} alt="" />
        <h1>Пользователи</h1>
      </div>
      <ul className="partners-list">
        {partners.map((partner) => {
          const exp = expenses.find(e => String(e.user_id) === String(partner.user_id)) ?? null
          return <li className="partner-card" key={partner.id} onClick={() => { navigate('/update', { state: { partner } }) }}>
            <div className="partner-data">
              <p className="card_heading">{partner.full_name}</p>
              <div className="partner-data-info">
                <p>Возраст: {calculateAge(partner.birthday)}</p>
                <p>{partner.position || 'Безработный'}</p>
                <p>{partner.organization || '-'}</p>
                <p>{partner.salary || 0}</p>
              </div>
            </div>
            <div className="partner-data card_heading">
              <p>Расход: {exp ? exp.total_expense : 0}</p>
              <p>Соотношение трат к доходу: {getCorrelation(exp)}</p>
              <p>{getExpenseResult(exp)}</p>
            </div>
          </li>
        })}
      </ul>

      <Link to={'/create'}>
        <button>
          Создать партнера
        </button>
      </Link>
    </>
  )
}

export default App
