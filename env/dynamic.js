() => ({
  API_VERSION: () => `v${process.env.npm_package_version.split('.')[0]}`,
  BRANCH_NAME: ({ ENV, PROD_ENV_TOKEN }) =>
    ENV === PROD_ENV_TOKEN ? 'main' : ENV,
  SERVICE_NAME: ({ API_CONTEXT, API_SUBDOMAIN }) =>
    `${API_SUBDOMAIN}-${API_CONTEXT}`,
  STACK_NAME: ({ API_VERSION, ENV, SERVICE_NAME }) =>
    `${SERVICE_NAME}-${API_VERSION}-${ENV}`,
  USER_OPENAPI_URL: ({ PROD_ENV_TOKEN, ROOT_DOMAIN, USER_STACK_NAME }) => {
    const { subdomain, basePath, env } = USER_STACK_NAME.match(
      /^(?<subdomain>[^-]+)-(?<basePath>.+)-(?<env>[^-]+)$/
    ).groups;
    return `https://${subdomain}.${ROOT_DOMAIN}/${basePath}${
      env === PROD_ENV_TOKEN ? '' : `-${env}`
    }/doc/openapi`;
  },
});
