import { type ChangeEvent, useMemo, useRef, useState } from "react";
import UserPageLayout from "~/components/UserPageLayout";
import Image from "next/image";
import { Input, Button, Checkbox } from "@nextui-org/react";

export default function UploadImagePage() {
  const [profilePhoto, setProfilePhoto] = useState<Blob | undefined | string>();

  const profilePictureURL = useMemo(
    () =>
      profilePhoto instanceof Blob
        ? URL.createObjectURL(profilePhoto)
        : profilePhoto,
    [profilePhoto]
  );

  const filePickerInput = useRef<HTMLInputElement>(null);

  function handleImageFile(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const [imageFile] = event.target.files;
      setProfilePhoto(imageFile);
    }
  }

  return (
    <UserPageLayout>
      <h1>upload images</h1>
      <Image
        src={profilePictureURL ?? "/profile-pics/Default.png"}
        height={300}
        width={200}
        alt=""
      />
      <Input
        onChange={handleImageFile}
        ref={filePickerInput}
        type="file"
        accept="image/*"
      />
      <Button color="primary">Say hi</Button>
      <Checkbox defaultSelected>Option</Checkbox>
    </UserPageLayout>
  );
}
