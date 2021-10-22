import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { createUseStyles } from 'react-jss';
import isArray from 'lodash.isarray';
import mergeWith from 'lodash.mergewith';
import omit from 'lodash.omit';
import cloneDeep from 'lodash.clonedeep';
import download from 'downloadjs';
import { Button } from '@welovedevs/ui';

import JsonStub from './data/json_stub.json';
import DeveloperProfile from './package';
import { ReactComponent as SaveIcon } from './package/assets/icons/drop_file.svg';

import { styles } from './app_styles';

// import ReactGA from 'react-ga';
// G-A needs some general improvements

// const TRACKING_ID = 'UA-219172152-1'; // YOUR_OWN_TRACKING_ID
// ReactGA.initialize(TRACKING_ID);

const useStyles = createUseStyles(styles);
const mergeFunction = (objValue, srcValue) => {
    if (!objValue || isArray(objValue)) {
        return srcValue;
    }
    return undefined;
};

const mode = process.env.REACT_APP_MODE || 'readOnly';

function App() {
    const classes = useStyles();
    const [data, setData] = useState(omit(JsonStub, 'resumeCustomization'));

    const onEdit = useCallback((newData) => setData(mergeWith(cloneDeep(data), newData, mergeFunction)), [
        JSON.stringify(data)
    ]);
    const [customization, setCustomization] = useState(JsonStub.resumeCustomization || {});

    const onCustomizationChanged = useCallback(setCustomization, [data]);

    const handleClick = useCallback(async () => {
        // eslint-disable-next-line no-undef
        const blob = new Blob([JSON.stringify({ ...data, resumeCustomization: customization })], {
            type: 'text/plain; charset=utf-8'
        });
        download(
            blob,
            `${`Resume-${data?.basics?.name || 'Developer'}`.replace(' ', '-')}.json`,
            'text/plain; charset=utf-8'
        );
    }, [JSON.stringify(data), JSON.stringify(customization)]);

    return (
        <DeveloperProfile
            mode={mode}
            data={data}
            onEdit={onEdit}
            onCustomizationChanged={onCustomizationChanged}
            options={{
                locale: 'en',
                // side: 'back',
                apiKeys: {
                    giphy: process.env.REACT_APP_GIPHY
                },
                endpoints: {
                    devicons: 'https://benjipeng.github.io/benjip-cv/assets/images/profile.png'
                },
                // dismissFooter : true
                showContactInfos: true,
                // maxSkills: 6,
                customization,
                disableSortableExperience: false,
                maxCardsPerRow: 4
            }}
            additionalNodes={{
                banner: {
                    actionsButtons: mode === 'edit' && (
                        <Button variant="outlined" onClick={handleClick} color={'light'}>
                            <SaveIcon className={classes.saveIcon} />
                            <FormattedMessage id="Profile.header.jsonResume.download" defaultMessage="Export" />
                        </Button>
                    )
                }
            }}
        />
    );
}

export default App;
