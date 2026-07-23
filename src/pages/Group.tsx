
import { useParams } from "react-router-dom";

const Group = () => {

    const { id } = useParams();

    return (
        <h1>Group ID : {id}</h1>
    )

}

export default Group;