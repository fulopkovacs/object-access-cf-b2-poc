import { type ChangeEvent, useMemo, useRef, useState } from "react";
import UserPageLayout from "~/components/UserPageLayout";
import { Button, Checkbox } from "@nextui-org/react";
import { RefreshCwIcon, UploadIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function UploadImagePage() {
  const [image, setProfilePhoto] = useState<Blob | undefined | string>();

  const imageUrl = useMemo(
    () => (image instanceof Blob ? URL.createObjectURL(image) : image),
    [image]
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
      <h1 className="text-center text-3xl font-semibold tracking-tight">
        Upload an image
      </h1>
      <div className="flex  w-full flex-col items-center justify-center gap-3 py-10">
        <motion.div
          key={imageUrl}
          className="flex h-72 items-center justify-center"
          layout
          layoutId={imageUrl}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className="block aspect-auto max-h-72 max-w-full rounded-lg"
              src={imageUrl}
              alt=""
            />
          ) : (
            <div className="h-72 w-48 rounded-lg bg-zinc-900"></div>
          )}
        </motion.div>
        <Button
          color={image ? "default" : "primary"}
          onClick={(e) => {
            e.preventDefault();
            filePickerInput.current?.click();
          }}
          startContent={
            image ? (
              <RefreshCwIcon className="h-4 w-4" />
            ) : (
              <UploadIcon className="h-4 w-4" />
            )
          }
        >
          {image ? "Change Image" : "Add image"}
        </Button>
      </div>
      <input
        onChange={handleImageFile}
        className="hidden"
        ref={filePickerInput}
        type="file"
        accept="image/*"
      />
      <Button color="primary">Say hi</Button>
      <Checkbox defaultSelected>Option</Checkbox>
    </UserPageLayout>
  );
}
