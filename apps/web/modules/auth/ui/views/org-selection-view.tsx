import { OrganizationList } from "@clerk/nextjs";

export const OrgSelectionView = () => {
  return (
    <OrganizationList
      fallbackRedirectUrl="/dashboard"
      hidePersonal
      skipInvitationScreen
    />
  );
};
