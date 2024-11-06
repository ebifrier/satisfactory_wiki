import type { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";

const toUrlSearchParams = (query: ParsedUrlQuery): URLSearchParams => {
  const params = new URLSearchParams();

  for (const key in query) {
    const value = query[key];
    if (typeof value === "string") {
      params.append(key, value);
    } else if (Array.isArray(value)) {
      params.append(key, value[0]);
    }
  }

  return params;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const params = toUrlSearchParams(query);

  return {
    redirect: {
      destination: `/item?${params.toString()}`,
      permanent: false,
    },
  };
};

const MyPage = () => {
  return <p>Redirecting...</p>;
};

export default MyPage;
