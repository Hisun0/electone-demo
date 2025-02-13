import { useEffect, useState } from "react"
import {useLocation, useNavigate} from 'react-router-dom';
import { Link } from "react-router";

export default function UpdatePartner() {
  useEffect(() => { document.title = 'Обновить пользователя' }, [])
  const location = useLocation()
  const navigate = useNavigate();
  const [partner, setPartner] = useState(location.state.partner);

  async function submitHandler(e) {
    e.preventDefault()
    const updPartner = {
      user_id: partner.user_id,
      full_name: e.target.full_name.value,
      birthday: e.target.birthday.value,
      organization: e.target.organization.value || null,
      start_date: e.target.start_date.value || null,
      position: e.target.position.value || null,
      salary: e.target.salary.value || null,
    }
    await window.api.updatePartner(updPartner);

    setPartner(updPartner)
    document.querySelector('form').reset()
    navigate('/')
  }

  return <div className="form">
    <Link to={'/'}><button>{"<-- Назад"}</button></Link>
    <h1>Обновить пользователя</h1>
    <form onSubmit={(e) => submitHandler(e)}>
      <label htmlFor="full_name">ФИО</label>
      <input id="full_name" type="text" defaultValue={partner.full_name} />
      <label htmlFor="birthday">Дата рождения:</label>
      <input type="date" id="birthday" name="birthday" defaultValue={partner.birthday.toISOString().split('T')[0]} />
      <label htmlFor="organization">Место работы:</label>
      <input id="organization" type="text" defaultValue={partner.organization} />
      <label htmlFor="start_date">Время начала работы:</label>
      <input type="date" id="start_date" defaultValue={
        partner.start_date
          ? partner.start_date.toISOString().split('T')[0]
          : null
      } />
      <label htmlFor="position">Должность:</label>
      <input id="position" type="text" defaultValue={partner.position} />
      <label htmlFor="salary">Оклад:</label>
      <input id="salary" type="number" step="1000" min='0' defaultValue={partner.salary} />
      <button type="submit">Обновить пользователя</button>
    </form>
  </div>
}
