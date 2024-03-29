import { v4 as uuid } from 'uuid';
import { FormData as NodeFormData } from 'universal-formdata';
import { FILE_KEY_PREFIX, JSON_KEY } from './constants';
import { isBrower } from './utils';

interface File {
  id: string;
  value: Blob;
}

function _createFile(input: Blob) {
  return { id: `${FILE_KEY_PREFIX}${uuid()}`, value: input };
}

export function pack(data: any) {
  const files: File[] = [];

  const json = JSON.stringify(data, (key, value) => {
    if (isBrower()) {
      if (value instanceof FileList) {
        const fileIds: string[] = [];

        for (let i = 0; i < value.length; i++) {
          const file = _createFile(value[i]);
          files.push(file);
          fileIds.push(file.id);
        }

        return fileIds;
      } else if (value instanceof Blob) {
        const file = _createFile(value);
        files.push(file);
        return file.id;
      }
    }

    return value;
  });

  const formData = isBrower() ? new FormData() : new NodeFormData();

  formData.append(JSON_KEY, json);

  files.forEach(({ id, value }) => {
    formData.append(id, value);
  });

  return formData as FormData;
}
