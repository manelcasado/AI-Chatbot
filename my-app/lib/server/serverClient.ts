import {
    ApolloClient,
    DefaultOptions,
    HttpLink,
    InMemoryCache,
    from,
    ApolloLink,
} from '@apollo/client';

const errorLink = new ApolloLink((operation, forward) => {
    return forward(operation).map((response) => {
        if (response.errors) {
            console.error('GraphQL Errors:', response.errors);
        }
        return response;
    });
});

const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    headers: {
        Authorization: `Apikey ${process.env.GRAPHQL_TOKEN}`,
    },
    fetch,
});

const defaultOptions: DefaultOptions = {
    watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    },
    query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    },
    mutate: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    },
};

export const serverClient = new ApolloClient({
    ssrMode: true,
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions,
    name: 'server-client',
    version: '1.0',
    queryDeduplication: false,
});