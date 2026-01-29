import { lazy } from 'react';
import { createFormHook } from '@tanstack/react-form';
import { fieldContext, formContext } from './form-context';

const CategorySelect = lazy(
  () => import('../components/form/category-select.tsx')
);
const ImageInput = lazy(() => import('../components/form/image-input.tsx'));
const ImageMegaPixels = lazy(
  () => import('../components/form/image-megapixel.tsx')
);
const ImagePreviews = lazy(
  () => import('../components/form/image-previews.tsx')
);
const ImageSize = lazy(() => import('../components/form/image-size.tsx'));
const SubscribeButton = lazy(
  () => import('../components/form/subscribe-button.tsx')
);
const TextArea = lazy(() => import('../components/form/text-area.tsx'));
const TextField = lazy(() => import('../components/form/text-field.tsx'));

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    CategorySelect,
    ImageInput,
    ImageMegaPixels,
    ImagePreviews,
    ImageSize,
    TextArea,
    TextField,
  },
  formComponents: {
    SubscribeButton,
  },
});
