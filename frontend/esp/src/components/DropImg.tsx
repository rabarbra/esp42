import {
    Image,
    SimpleGrid,
    Text
} from "@mantine/core";
import {
    Dropzone,
    FileWithPath,
    IMAGE_MIME_TYPE
} from "@mantine/dropzone";
import React from "react";
import PixelateImg from "./PixelateImg";

const DropImg = () => {
    const [files, setFiles] = React.useState<FileWithPath[]>([]);
    const previews = files.map((file, index) => {
        const imageUrl = URL.createObjectURL(file);
        return (
            <PixelateImg
                key={index}
                src={imageUrl}
                width={320}
                height={320}
                pixelSize={40}
                //imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
            />
        );
    });
    return (
        <div>
            <Dropzone accept={IMAGE_MIME_TYPE} onDrop={setFiles}>
                <Text align="center">Drop images here</Text>
            </Dropzone>
        
            <SimpleGrid
                cols={4}
                breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
                mt={previews.length > 0 ? 'xl' : 0}
            >
                {previews}
            </SimpleGrid>
        </div>
    );
  }

export default DropImg;
  