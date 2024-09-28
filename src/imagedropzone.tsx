"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface Image {
  id: string;
  src: string;
}

export default function Component() {
  const [uploadedImages, setUploadedImages] = useState<Image[]>([]);
  const [selectedImages, setSelectedImages] = useState<Image[]>([]);
  const [containerSize, setContainerSize] = useState({
    width: 900,
    height: 100,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      src: URL.createObjectURL(file),
    }));
    setUploadedImages((prevImages) => [...prevImages, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    const updateContainerSize = () => {
      const container = document.getElementById("image-container");
      if (container) {
        const width = Math.min(container.offsetWidth, 900);
        setContainerSize({ width, height: 100 });
      }
    };

    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);
    return () => window.removeEventListener("resize", updateContainerSize);
  }, []);

  const imageWidth =
    selectedImages.length > 0
      ? containerSize.width / selectedImages.length
      : containerSize.width;

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceId = result.source.droppableId;
    const destId = result.destination.droppableId;

    if (sourceId === destId) {
      const items = Array.from(
        sourceId === "uploadedImages" ? uploadedImages : selectedImages
      );
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      if (sourceId === "uploadedImages") {
        setUploadedImages(items);
      } else {
        setSelectedImages(items);
      }
    } else {
      const sourceItems = Array.from(
        sourceId === "uploadedImages" ? uploadedImages : selectedImages
      );
      const destItems = Array.from(
        destId === "uploadedImages" ? uploadedImages : selectedImages
      );
      const [movedItem] = sourceItems.splice(result.source.index, 1);
      destItems.splice(result.destination.index, 0, movedItem);

      setUploadedImages(
        sourceId === "uploadedImages" ? sourceItems : destItems
      );
      setSelectedImages(
        sourceId === "selectedImages" ? sourceItems : destItems
      );
    }
  };

  return (
    <div className="p-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Uploaded Images</h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed p-4 mb-4 text-center cursor-pointer ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Suelta las imágenes aquí...</p>
            ) : (
              <p>
                Arrastra y suelta imágenes aquí, o haz clic para seleccionar
                archivos
              </p>
            )}
          </div>
          <Droppable droppableId="uploadedImages" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex flex-wrap gap-2"
              >
                {uploadedImages.map((image, index) => (
                  <Draggable
                    key={image.id}
                    draggableId={image.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="w-16 h-16 relative"
                      >
                        <img
                          src={image.src}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <h2 className="text-xl font-bold mb-2">Selected Images</h2>
        <Droppable droppableId="selectedImages" direction="horizontal">
          {(provided) => (
            <div
              id="image-container"
              className="w-full max-w-[900px] h-[100px] mx-auto bg-gray-100 relative overflow-hidden flex"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {selectedImages.map((image, index) => (
                <Draggable key={image.id} draggableId={image.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="h-full flex-shrink-0"
                      style={{
                        width: `${imageWidth}px`,
                        ...provided.draggableProps.style,
                      }}
                    >
                      <img
                        src={image.src}
                        alt="Selected"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
