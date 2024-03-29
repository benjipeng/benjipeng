import { translations } from './edit_contact_infos_button/contact_infos_translations';

import { ReactComponent as PhoneIcon } from '../../../../../assets/icons/phone.svg';
import { ReactComponent as EmailIcon } from '../../../../../assets/icons/email.svg';
import { ReactComponent as PersonIcon } from '../../../../../assets/icons/person_info.svg';
import { ReactComponent as WebIcon } from '../../../../../assets/icons/link.svg';

export const CONTACT_INFOS_DATA = {
    name: {
        path: 'basics.name',
        translation: translations.name,
        icon: PersonIcon,
        onlyDialog: true
    },
    phone: {
        path: 'basics.phone',
        translation: translations.phone,
        icon: PhoneIcon
    },
    portfolio: {
        path: 'basics.portfolio',
        translation: translations.portfolio,
        icon: WebIcon
    },
    email: {
        path: 'basics.email',
        translation: translations.email,
        icon: EmailIcon
    }
};
