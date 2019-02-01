import recommended from './configs/recommended';
// @ts-ignore
const requireIndex = require('requireindex');
export const rules = requireIndex(`${__dirname}/rules`);
export const configs = {
    'recommended': recommended
};
