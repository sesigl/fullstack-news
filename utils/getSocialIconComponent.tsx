import * as SocialIconsComponent from '../components/social';
import {ComponentProps} from "react";

export const getSocialIconComponent = ( { name, props }: { name: string, props: ComponentProps<any> } ) => {
	const ComponentsMap = {
    twitter: SocialIconsComponent.Twitter,
		facebook: SocialIconsComponent.Facebook,
		instagram: SocialIconsComponent.Instagram,
		linkedin: SocialIconsComponent.Linkedin
	}

	if ( name in ComponentsMap ) {
		// @ts-ignore
		const SocialIconComponent = ComponentsMap[name];
		return <SocialIconComponent {...props} />;
	} else {
		return null
	}
}