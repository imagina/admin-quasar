import { Loading } from 'quasar';
import treeSelect from '@riophae/vue-treeselect';
//[ptc]import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import crud from '@imagina/qcrud/_components/crud';
import innerLoading from '@imagina/qsite/_components/master/innerLoading';
import notFound from '@imagina/qsite/_components/master/404';
import notAuthorized from '@imagina/qsite/_components/master/notAuthorized';
import notResult from '@imagina/qsite/_components/master/notResults';
import uploadImg from '@imagina/qsite/_components/master/uploadImage';
import dynamicField from '@imagina/qsite/_components/master/dynamicField';
import dynamicForm from '@imagina/qsite/_components/master/dynamicForm';
import captcha from '@imagina/qsite/_components/master/captcha';
import locales from '@imagina/qsite/_components/master/locales';
import avatarImage from '@imagina/qsite/_components/master/avatarImage';
import headerToApp from '@imagina/qsite/_components/master/headerToApp';
import shareLink from '@imagina/qsite/_components/master/shareLink';
import btnMenu from '@imagina/qsite/_components/master/btnMenu';
import masterModal from '@imagina/qsite/_components/master/masterModal';
import pageActions from '@imagina/qsite/_components/master/pageActions';
import crudComponent from '@imagina/qcrud/_components/v2/crud';
import kanban from '@imagina/qsite/_components/master/kanban/index.vue';
import folders from '@imagina/qsite/_components/master/folders/index.vue';
import promiseTemplate from '@imagina/qsite/_components/master/promiseTemplate/index.vue';
//[ptc]
import activities from '@imagina/qgamification/_components/categoryView/index.vue';
import helpText from '@imagina/qsite/_components/master/helpText.vue';


export default ({ app }) => {
  //Components
  let components = [
    { name: 'crud', component: crud },
    { name: 'tree-select', component: treeSelect },
    { name: 'inner-loading', component: innerLoading },
    { name: 'not-found', component: notFound },
    { name: 'not-authorized', component: notAuthorized },
    { name: 'not-result', component: notResult },
    { name: 'upload-image', component: uploadImg },
    { name: 'dynamic-field', component: dynamicField },
    { name: 'dynamic-form', component: dynamicForm },
    { name: 'captcha', component: captcha },
    { name: 'locales', component: locales },
    { name: 'avatar-image', component: avatarImage },
    { name: 'header-app', component: headerToApp },
    { name: 'share-link', component: shareLink },
    { name: 'btn-menu', component: btnMenu },
    { name: 'master-modal', component: masterModal },
    { name: 'page-actions', component: pageActions },
    { name: 'crud-component', component: crudComponent },
    { name: 'kanban', component: kanban },
    { name: 'folders', component: folders },
    { name: 'promiseTemplate', component: promiseTemplate },
    //[ptc]
    { name: 'activities', component: activities },
    { name: 'help-text', component: helpText }
  ];

  //Register components
  components.forEach(item => app.component(item.name, item.component));

  //Hidde loading
  Loading.hide();
}
