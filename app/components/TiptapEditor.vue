<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'

const props = defineProps<{
  modelValue: string
}>)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 underline'
      }
    }),
    Underline,
    Image.configure({
      inline: true,
      allowBase64: true
    })
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 border rounded bg-white'
    }
  }
})

watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getHTML() !== newValue) {
    editor.value.commands.setContent(newValue, false)
  }
})

function addLink() {
  const url = window.prompt('URL do link:')
  if (url) {
    editor.value?.chain().focus().setLink({ href: url }).run()
  }
}

function removeLink() {
  editor.value?.chain().focus().unsetLink().run()
}
</script>

<template>
  <div class="border rounded overflow-hidden">
    <div class="bg-gray-50 border-b p-2 flex gap-2 flex-wrap">
      <button
        @click="editor?.chain().focus().toggleBold().run()"
        :class="{ 'bg-gray-200': editor?.isActive('bold') }"
        class="px-2 py-1 rounded text-sm font-bold"
        title="Negrito"
      >
        B
      </button>
      <button
        @click="editor?.chain().focus().toggleItalic().run()"
        :class="{ 'bg-gray-200': editor?.isActive('italic') }"
        class="px-2 py-1 rounded text-sm italic"
        title="Itálico"
      >
        I
      </button>
      <button
        @click="editor?.chain().focus().toggleUnderline().run()"
        :class="{ 'bg-gray-200': editor?.isActive('underline') }"
        class="px-2 py-1 rounded text-sm underline"
        title="Sublinhado"
      >
        U
      </button>
      <button
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'bg-gray-200': editor?.isActive('heading', { level: 2 }) }"
        class="px-2 py-1 rounded text-sm"
        title="H2"
      >
        H2
      </button>
      <button
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'bg-gray-200': editor?.isActive('heading', { level: 3 }) }"
        class="px-2 py-1 rounded text-sm"
        title="H3"
      >
        H3
      </button>
      <button
        @click="editor?.chain().focus().toggleBulletList().run()"
        :class="{ 'bg-gray-200': editor?.isActive('bulletList') }"
        class="px-2 py-1 rounded text-sm"
        title="Lista"
      >
        •
      </button>
      <button
        @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="{ 'bg-gray-200': editor?.isActive('orderedList') }"
        class="px-2 py-1 rounded text-sm"
        title="Lista numerada"
      >
        1.
      </button>
      <button
        @click="addLink"
        class="px-2 py-1 rounded text-sm"
        title="Adicionar link"
      >
        🔗
      </button>
      <button
        v-if="editor?.isActive('link')"
        @click="removeLink"
        class="px-2 py-1 rounded text-sm bg-red-100"
        title="Remover link"
      >
        ❌
      </button>
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>

<style>
.ProseMirror:focus {
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
</style>
