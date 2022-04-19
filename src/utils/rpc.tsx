import axios from "axios";

export const getToken = async () => {
  const { data } = await axios.get(
    process.env.REACT_APP_CONNECTION_TOKEN as string
  );
  return data.access_token as string;
};
