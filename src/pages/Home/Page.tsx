import { useEffect } from "react";

import SyncServerApiSDK from "sync-server-api-sdk";

import { getSessionData } from "../../lib/requests";

export default function Home() {
  useEffect(() => {
    (async () => {
      const session = await getSessionData();
    })();
  }, []);

  return (
    <>
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aliquam quidem
      voluptatem excepturi, ratione, et rerum enim facere perferendis nostrum
      ipsum cumque eum modi repellendus sint dolorum sit nobis quisquam harum!
    </>
  );
}
