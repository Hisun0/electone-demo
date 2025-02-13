import { useEffect } from "react"
import { Link } from "react-router";

export default function CreatePartner() {
  useEffect(() => { document.title = 'Создать пользователя' }, [])
  async function submitHandler(e) {
    e.preventDefault()
    const partner = {
      full_name: e.target.full_name.value,
      birthday: e.target.birthday.value,
      organization: e.target.organization.value,
      start_date: e.target.start_date.value,
      position: e.target.position.value,
      salary: e.target.salary.value,
    }
    await window.api.createPartner(partner);
    document.querySelector('form').reset()
  }

  return <div className="form">
    <Link to={'/'}><button>{"<-- Назад"}</button></Link>

    <h1>Создать пользователя</h1>
    <form onSubmit={(e) => submitHandler(e)}>
      <label htmlFor="full_name">ФИО</label>
      <input id="full_name" type="text" required/>
      <label htmlFor="birthday">Дата рождения:</label>
      <input type="date" id="birthday" name="birthday" required/>
      <label htmlFor="organization">Место работы:</label>
      <input id="organization" type="text"/>
      <label htmlFor="start_date">Время начала работы:</label>
      <input type="date" id="start_date"/>
      <label htmlFor="position">Должность:</label>
      <input id="position" type="text"/>
      <label htmlFor="salary">Оклад:</label>
      <input id="salary" type="number" step="1000" min='0'/>
      <button type="submit">Создать пользователя</button>
    </form>
  </div>
}
