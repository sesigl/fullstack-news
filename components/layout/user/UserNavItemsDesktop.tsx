import {useUser} from "@auth0/nextjs-auth0";
import UserLoggedIn from "./UserLoggedIn";
import UserLoggedOut from "./UserLoggedOut";

export default function UserNavItemsDesktop() {
  const {user} = useUser();

  return <>
    {/* For non Mobile */}
    {user && <UserLoggedIn/>}
    {!user && <UserLoggedOut/>}
  </>
}
