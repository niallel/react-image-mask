import type { Meta, StoryObj } from '@storybook/react';
import ImageMask from './ImageMask';

const meta: Meta<typeof ImageMask> = {
  title: 'Components/ImageMask',
  component: ImageMask,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    maskColor: { control: 'color' },
    width: { control: { type: 'number', min: 100, max: 800 } },
    height: { control: { type: 'number', min: 100, max: 800 } },
  },
};

export default meta;
type Story = StoryObj<typeof ImageMask>;

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/800/600',
    maskColor: 'rgba(0, 0, 0, 0.5)',
    width: 800,
    height: 600,
  },
};

export const LargeSize: Story = {
  args: {
    src: 'https://picsum.photos/600/400',
    maskColor: 'rgba(0, 0, 0, 0.5)',
    width: 600,
    height: 400,
  },
};

export const CustomMaskColor: Story = {
  args: {
    src: 'https://picsum.photos/1024/1024',
    maskColor: 'rgba(255, 0, 0, 0.5)',
    width: 1024,
    height: 1024,
  },
}; 