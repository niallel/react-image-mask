import type { Meta, StoryObj } from '@storybook/react';
import ImageMask from '../components/ImageMask/ImageMask';

const meta = {
  title: 'ImageMask',
  component: ImageMask,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' },
    maskColor: { control: 'color' },
    width: { control: 'number' },
    height: { control: 'number' },
  },
} satisfies Meta<typeof ImageMask>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/1024/1024',
    width: 1024,
    height: 1024,
  },
}; 