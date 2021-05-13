import TikTokAPI, { getRequestParams } from "tiktok-api";
const Signer = require("tiktok-signature");

const signURL = (
  url: string,
  ts: number,
  deviceId: string
): string | Promise<string> => {
  const as = "23d22211fe06dcd8a2927b2fbc6cd74d";
  const cp = "164967f5772b6f50e2424c062c804a23";
  const mas = "d0cbc0a4b4b89fe0525c449c785cc736";
  return `${url}&as=${as}&cp=${cp}&mas=${mas}`;
};

const params = getRequestParams({
  device_id: "6594726280552547846",
  fp: "",
  iid: "6620659482206930694",
  openudid: "b307b864b574e818",
});

const api = new TikTokAPI(params, { signURL });

const getUser = async () => {
  const user = await api.getUser("6692571794207474693");
  console.log(user);
};

(async () => {
  await getUser();
})();
