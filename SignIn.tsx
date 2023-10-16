import type { FC } from 'react';
import { useRef, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { LockOutlined, MailOutline } from '@mui/icons-material';
// eslint-disable-next-line import/no-named-as-default
import ReCAPTCHA from 'react-google-recaptcha';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Logo, signinAdminBg } from '@/assets/images';
import { Button, Input } from '@/components/global';
import { useAppDispatch, useAppTranslation } from '@/hooks';
import { appToast } from '@/lib/ToastContainers';
import { AuthErrors } from '@/lib/errors';
import type { SignInFormType } from '@/lib/forms';
import { signInFormSchema } from '@/lib/forms';
import { AdminsService } from '@/services';
import { setConnectedUser } from '@/store/actions/action-creators';
import { SITE_KEY } from '@/utils/constants';

import { ThemeSwitch } from '../common';

enum SignInStatus {
  INITIAL,
  IN_PROGRESS,
  DONE,
  ERROR,
}

interface SignInProps {}

const SignIn: FC<SignInProps> = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useAppTranslation();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [signInStatus, setSignInStatus] = useState(SignInStatus.INITIAL);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      email: 'boreAdmin@wecraft.tn',
      password: 'wecraft',
      rememberMe: false,
    },
    mode: 'all',
    resolver: yupResolver(signInFormSchema),
  });

  const onSubmit = async (data: SignInFormType) => {
    setSignInStatus(SignInStatus.IN_PROGRESS);

    const token =
      recaptchaRef.current && (await recaptchaRef.current.executeAsync());

    AdminsService.signIn(data, token)
      .then((res) => {
        const accessToken = res.data.accessToken;
        setSignInStatus(SignInStatus.DONE);
        localStorage.setItem('access-token', accessToken);
        dispatch(setConnectedUser(res.data.user));
        if (!res.data.user.roles.length) navigate('/wizard');
        else navigate('/dashboard');
      })
      .catch((error) => {
        recaptchaRef.current?.reset();
        setSignInStatus(SignInStatus.ERROR);

        const errorCode = error?.response?.data?.code;

        AuthErrors[errorCode as keyof typeof AuthErrors] &&
          appToast.error(t(AuthErrors[errorCode as keyof typeof AuthErrors]));
      });
  };

  return (
    <div className="flex min-h-screen bg-first">
      
      <div className="w-3/4 max-w-[900px] min-w-screen min-h-screen mx-auto h-full flex-col flex items-center justify-center sm:w-3/6 transition-all duration-1000">
        <div className="w-full h-full sm:w-full md:w-2/3 lg:w-5/6 xl:w-7/12">
          <div className="  flex justify-center items-center">
            <Logo />
          </div>

          <div className="flex justify-center">
            <h1 className="transition-all color-black	 font-semibold mt-6  mb-3 t xl:mt-12">
              {t('Sign In')}
            </h1>
          </div>

          <p className="color-grey text-center">
            {t(
              "Welcome back to login. As an admin, you have access to manage our user's information."
            )}
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="w-full  gap-y-[10px]  flex flex-col lg:gap-y-[10px] xl:gap-y-[25px] mt-12">
              <Input
                cls="bg-transparent rounded-lg border-input placeholder-gray focus:outline-none"
                errorCls="focus:outline-none"
                icon={
                  <MailOutline className="icons-input-size text-[#9E9DA8]" />
                }
                placeholder={t('Email')}
                refs={register('email')}
                errorMsg={
                  errors.email && t('Please enter a valid e-mail address')
                }
              />

              <Input
                cls="bg-transparent rounded-lg border-input placeholder-gray focus:outline-none"
                errorCls="focus:outline-none"
                icon={
                  <LockOutlined className="icons-input-size text-[#9E9DA8]" />
                }
                placeholder={t('Password')}
                type="password"
                refs={register('password')}
              />
            </div>


           
          </form>
        </div>
      </div>

      <div className="hidden lg:flex bg-sec  bg-blue-low-opacity w-[50%] items-center justify-center">
        <div>
          <div className="flex justify-center">
            <img alt="SignupIcon" src={signinAdminBg} />
          </div>

          <div className="w-[60%] ml-auto mr-auto">
            <p className="text-justify color-black mt-2">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
            </p>
          </div>
          <div className="w-[60%] ml-auto mr-auto">
            <p className="text-justify color-black mt-2">
             aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa jenkins
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
