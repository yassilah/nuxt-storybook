import TheButton from './the-button.vue';

export default {
  title: 'TheButton',
  component: TheButton,
};

export const Primary = {
  render: () => ({
    components: { TheButton },
    template: '<TheButton>Coucou</TheButton>',
  }),
};