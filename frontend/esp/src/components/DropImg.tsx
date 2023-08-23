import React        from "react";
import {
    SimpleGrid,
    Stack,
    Text
}                   from "@mantine/core";
import {
    Dropzone,
    FileWithPath,
    IMAGE_MIME_TYPE
}                   from "@mantine/dropzone";
import PixelateImg  from "./PixelateImg";
import ws           from "../api/api";

const DropImg = (props: {scrl: () => void}) => {
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
                scrl={props.scrl}
                clbck={ws.sendArray}
            />
        );
    });
    return (
        <Stack mt={40}>
            <Dropzone accept={IMAGE_MIME_TYPE} onDrop={setFiles}>
                <Text align="center">Drop images here</Text>
            </Dropzone>
            <SimpleGrid cols={3}
                mt={previews.length > 0 ? 'xl' : 0}
                breakpoints={[
                    {maxWidth: "xs", cols: 1},
                    {maxWidth: "md", cols: 2}
                ]}
            >
                {previews}
            </SimpleGrid>
        </Stack>
    );
  }

export default DropImg;
  