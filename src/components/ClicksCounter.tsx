import { api } from "~/utils/api";

export function ClicksCounter() {
  const utils = api.useContext();
  const allClicks = api.example.getAllClicks.useQuery();
  const updateTheClicksData = api.example.insertClick.useMutation({
    onSuccess: () => {
      void utils.example.getAllClicks.invalidate();
    },
  });
  return (
    <div>
      <button
        className="rounded-md bg-yellow9 px-4 py-2 font-semibold tracking-tight text-gray1 hover:bg-yellow10"
        onClick={() =>
          updateTheClicksData.mutate({ pathname: window.location.pathname })
        }
      >
        Increase the number of clicks by 1
      </button>
      <ul className="list-inside list-disc">
        {allClicks.data?.map((c) => (
          <li key={c.id}>
            {`"${c.pathname}"`}: {c.numberOfClicks}
          </li>
        ))}
      </ul>
    </div>
  );
}
