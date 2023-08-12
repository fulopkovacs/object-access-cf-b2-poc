import {
  Link,
  Card,
  CardBody,
  Image,
  Switch,
  Progress,
} from "@nextui-org/react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import prettyBytes from "pretty-bytes";
import { useMemo, useState } from "react";
import UserPageLayout from "~/components/UserPageLayout";
import { api } from "~/utils/api";
import { useTimer } from "react-timer-hook";
import { AnimatePresence, motion } from "framer-motion";

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
  KV is eventually-consistent, so:

  "Changes are usually immediately visible in the Cloudflare
  global network location at which they are made but may
  take up to 60 seconds or more to be visible in other
  global network locations as their cached versions
  of the data time out."

  src:
  https://developers.cloudflare.com/workers/learning/how-kv-works/#consistency
  */
  const maxKVsyncTime = 60; // 60 sec = 1 min

  const expiryTimestamp = useMemo(() => {
    const time = new Date();
    time.setSeconds(time.getSeconds() + maxKVsyncTime);
    return time;
  }, []);

  const { seconds, isRunning, restart, start } = useTimer({
    expiryTimestamp,
    autoStart: false,
    onExpire: () => console.warn("onExpire called"),
  });

  const updateObjectAccess = api.example.updateObjectAccess.useMutation({
    onSuccess: async () => {
      await utils.example.getAllImages.invalidate();
      const time = new Date();
      time.setSeconds(time.getSeconds() + maxKVsyncTime);
      restart(time);
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

  const progressValue = useMemo(() => {
    return 100 - Math.floor((seconds / maxKVsyncTime) * 100);
  }, [seconds]);

  return (
    <>
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
      <AnimatePresence>
        {seconds !== 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 100 }}
            exit={{ opacity: 100 }}
          >
            <Progress
              aria-label="SynchronizationProgress"
              size="sm"
              value={progressValue}
              label="Synchronizing changes..."
              color="success"
              showValueLabel={true}
              className="mt-2"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ImageCard({ imageData }: ImageDataProps) {
  return (
    <Card className="h-60 cursor-pointer py-4">
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
        <div className="min-w-1/2 flex h-full w-1/2 flex-col">
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
