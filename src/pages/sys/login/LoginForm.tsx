import { App, Button, Checkbox, Col, Divider, Form, Input, Row } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SignInReq } from '@/api/services/userService';
import LogoHome from '@/assets/images/background/logo-futa.png';
import authAPI from '@/redux/api/services/authAPI';
import { useRouter } from '@/router/hooks';

import { LoginStateEnum, useLoginStateContext } from './providers/LoginStateProvider';

function LoginForm() {
   const { t } = useTranslation();
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(false);
   const { replace } = useRouter();
   const { loginState, setLoginState } = useLoginStateContext();
   const signIn = authAPI.signin;
   if (loginState !== LoginStateEnum.LOGIN) return null;
   const handleFinish = async ({ username, password }: SignInReq) => {
      setLoading(true);
      try {
         const res = await signIn({ username, password });
         if (res.status === 201) {
            notification.success({
               message: 'Login success!',
               duration: 3,
            });
            replace('/');
         } else {
            notification.error({
               message: 'Login failed!',
               duration: 3,
            });
         }
      } finally {
         setLoading(false);
      }
   };
   return (
      <>
         <div className="mb-10 flex items-center justify-center text-2xl font-bold xl:text-3xl">
            <img src={LogoHome} alt="logo" width={400} />
         </div>
         <div className="mb-4 text-2xl font-bold xl:text-3xl">{t('sys.login.signInFormTitle')}</div>
         <Form name="login" size="large" onFinish={handleFinish}>
            <Form.Item name="username" rules={[{ required: true, message: t('sys.login.accountPlaceholder') }]}>
               <Input placeholder={t('sys.login.userName')} />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: t('sys.login.passwordPlaceholder') }]}>
               <Input.Password type="password" placeholder={t('sys.login.password')} />
            </Form.Item>
            <Form.Item>
               <Row align="middle">
                  <Col span={12}>
                     <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>{t('sys.login.rememberMe')}</Checkbox>
                     </Form.Item>
                  </Col>
                  <Col span={12} className="text-right">
                     <Button
                        type="link"
                        className="!underline"
                        onClick={() => setLoginState(LoginStateEnum.RESET_PASSWORD)}
                        size="small"
                     >
                        {t('sys.login.forgetPassword')}
                     </Button>
                  </Col>
               </Row>
            </Form.Item>
            <Form.Item>
               <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                  {t('sys.login.loginButton')}
               </Button>
            </Form.Item>
            <Divider className="!text-xs">{t('sys.login.otherSignIn')}</Divider>
            <Row align="middle" gutter={8}>
               <Col flex="1">
                  <Button className="w-full !text-sm" onClick={() => setLoginState(LoginStateEnum.MOBILE)}>
                     {t('sys.login.mobileSignInFormTitle')}
                  </Button>
               </Col>
            </Row>
         </Form>
      </>
   );
}

export default LoginForm;
