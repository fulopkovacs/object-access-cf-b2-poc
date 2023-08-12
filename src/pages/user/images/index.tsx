import { Link, Card, CardBody, Image, Switch } from "@nextui-org/react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import prettyBytes from "pretty-bytes";
import { useState } from "react";
import UserPageLayout from "~/components/UserPageLayout";
import { api } from "~/utils/api";

type ImageData = {
  id: number;
  filename: string;
  public: boolean;
  url: string;
  size: number;
  filetype: string;
  created_at: number;
};

type ImageDataProps = { imageData: ImageData };

function MakeImagePublicSwitch({ imageData }: ImageDataProps) {
  const [isPublic, setIsPublic] = useState(imageData.public);
  const utils = api.useContext();
  /**
  It takes 60 seconds max to synchronise the
  Cloudfare KV store instances on all edge points.
  (It's an eventually consistent KV storage.)
  */
  const maxKVsyncTime = 60; // 60 sec = 1 min

  const updateObjectAccess = api.example.updateObjectAccess.useMutation({
    onSuccess: async () => {
      await utils.example.getAllImages.invalidate();
    },
    onError: () => {
      // revert to the old value
      setIsPublic((v) => !v);
    },
  });

  function changeObjectAccess(newIsPublicValue: boolean) {
    setIsPublic(newIsPublicValue);
    updateObjectAccess.mutate({
      imageId: imageData.id,
      isPublic: newIsPublicValue,
      fileName: imageData.filename,
    });
  }

  return (
    <Switch
      isDisabled={updateObjectAccess.isLoading}
      size="sm"
      isSelected={isPublic}
      onValueChange={(v) => void changeObjectAccess(v)}
      startContent={<EyeIcon />}
      endContent={<EyeOffIcon />}
      className="group/switch mt-2"
    >
      <span className="opacity-50 transition-opacity group-data-[selected=true]/switch:opacity-100">
        Make image public
      </span>
    </Switch>
  );
}

function ImageCard({ imageData }: ImageDataProps) {
  return (
    <Card className="h-56 cursor-pointer py-4">
      <CardBody className="flex  flex-row gap-8 py-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="w-1/2">
          {imageData.public ? (
            <Image
              removeWrapper
              alt="Card background"
              className="h-full rounded-xl object-cover"
              src={imageData.url}
              width={270}
              height={200}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-gray-700 text-neutral-400">
              <EyeOffIcon />
            </div>
          )}
        </div>
        <div className="flex h-full w-1/2 flex-col">
          <h2 className="mb-2 font-semibold">{imageData.filename}</h2>
          <small className="block text-neutral-400">
            {prettyBytes(imageData.size)}
          </small>
          <small className="flex items-center gap-1 text-neutral-400">
            {new Date(imageData.created_at).toLocaleString()}
          </small>
          <MakeImagePublicSwitch imageData={imageData} />
          <Link
            size="sm"
            className="mt-auto"
            showAnchorIcon
            target="_blank"
            href={imageData.url}
          >
            View image
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

export default function ImagesPage() {
  const getImages = api.example.getAllImages.useQuery();

  return (
    <UserPageLayout>
      <h1 className="text-center text-3xl font-semibold tracking-tight">
        Images
      </h1>
      <div className="mx-auto grid w-full max-w-xl grid-cols-1 gap-6 px-6 py-10">
        {getImages.data?.map((image) => (
          // <div key={image.id}>{image.filename}</div>
          <ImageCard key={image.id} imageData={image} />
        ))}
        {getImages.data?.length === 0 && (
          <p className="py-10 text-center text-neutral-400">
            No images were found
          </p>
        )}
      </div>
    </UserPageLayout>
  );
}
