import { useParams } from "react-router-dom"

export default function Test() {
    const params = useParams()
    return <div>{params['id']}</div>
}
  