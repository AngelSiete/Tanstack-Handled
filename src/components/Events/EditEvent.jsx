import { Link, redirect, useNavigate, useParams } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, updateEvent, queryClient } from "../../util/http.js";

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const { data, isPending, isError } = useQuery({
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    queryKey: ["events", params.id],
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent = data.event;
      await queryClient.cancelQueries({ queryKey: ["events", params.id] });
      const oldEvent = queryClient.getQueryData(["events", params.id]);
      queryClient.setQueryData(["events", params.id], newEvent);
      return { oldEvent };
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(["events", params.id], context.oldEvent);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["events", params.id])
    }
  });

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  return (
    <Modal onClose={handleClose}>
      {isPending && <p>Loading...</p>}
      {isError && <p>Error occured !</p>}
      {!isPending && !isError && data && (
        <EventForm inputData={data} onSubmit={handleSubmit}>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update
          </button>
        </EventForm>
      )}
    </Modal>
  );
}

export function loader({params}){
  return queryClient.fetchQuery({
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    queryKey: ["events", params.id],
  });
}

export async function action({request, params}){
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({id:params.id, event:updatedEventData});
  queryClient.invalidateQueries(["events"])
  redirect('../')
}