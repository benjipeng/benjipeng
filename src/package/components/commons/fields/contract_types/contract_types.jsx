import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
// import capitalize from 'lodash.capitalize';

// import translations from './contract_types_translations';

export const ContractType = ({ contractTypes = [] }) => {
    const { formatMessage } = useIntl();

    const contracts = [...contractTypes];
    const lastContract = contracts.pop();

    return <div style={{ fontWeight: 600 }}>📑 Freelance, Fix-term, or Full-time</div>;
};
