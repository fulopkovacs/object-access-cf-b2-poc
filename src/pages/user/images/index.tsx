import { Card, CardBody, CardHeader, Image } from "@nextui-org/react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import prettyBytes from "pretty-bytes";
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

function ImageCard({ imageData }: { imageData: ImageData }) {
  return (
    <a target="_blank" href={imageData.url}>
      <Card className="max-h-40 cursor-pointer gap-3 py-4">
        <CardBody className="flex  flex-row gap-3 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="w-1/2">
            <Image
              removeWrapper
              alt="Card background"
              className="h-full rounded-xl object-cover"
              src={imageData.url}
              width={270}
              height={200}
            />
          </div>
          <div className="w-1/2">
            <h2>{imageData.filename}</h2>
            <small className="block text-neutral-400">
              {prettyBytes(imageData.size)}
            </small>
            <small className="flex items-center gap-1 text-neutral-400">
              {imageData.public ? (
                <EyeIcon className="h-4 w-4" />
              ) : (
                <EyeOffIcon className="h-4 w-4" />
              )}
              {imageData.public ? "public" : "private"}
            </small>
            <small className="flex items-center gap-1 text-neutral-400">
              {" "}
              {new Date(imageData.created_at).toLocaleString()}
            </small>
          </div>
        </CardBody>
      </Card>
    </a>
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
      </div>
    </UserPageLayout>
  );
}
