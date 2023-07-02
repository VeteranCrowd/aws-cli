() => ({
  API_VERSION: () =>
    `v${(process.env.npm_package_version ?? '').split('.')[0]}`,
  BRANCH_NAME: ({ ENV, PROD_ENV_TOKEN }) =>
    ENV === PROD_ENV_TOKEN ? 'main' : ENV,
  SERVICE_NAME: ({ API_CONTEXT, API_SUBDOMAIN }) =>
    `${API_SUBDOMAIN}-${API_CONTEXT}`,
  STACK_NAME: ({ API_VERSION, ENV, SERVICE_NAME }) =>
    `${SERVICE_NAME}-${API_VERSION}-${ENV}`,
});
