import { NormalPage } from "../components/Layout"
import { HomeSideBar } from "./Home"
import { useParams } from "react-router-dom"
import { useProduct } from "../hooks/api/products"
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";

export default function ProductDetail() {
  const { id } = useParams()
  const product = useProduct(id ?? '')
  return <div>
    <NormalPage sideBar={<HomeSideBar canEditProduct={product?.product?.id().authorized} />}>
      <div className="bg-white">
        <div className="2xl:container 2xl:mx-auto md:py-12 lg:px-20 md:px-6 py-9 px-4">
          <div id="Sus" className="lg:p-10 md:p-6 p-4 bg-white">
            <div className="flex justify-end">
              <button className="focus:outline-none focus:ring-2 focus:ring-gray-800">
              </button>
            </div>
            <div className="mt-3 md:mt-4 lg:mt-0 flex flex-col lg:flex-row justify-center lg:space-x-20 ">
              <CarouselProvider naturalSlideWidth={100} naturalSlideHeight={100} totalSlides={product?.images?.length ?? 0} className="flex justify-between items-strech  px-2 md:pt-6 md:px-6 lg:pt-24">
                <div className="flex items-center">
                  <ButtonBack aria-label="slide back" className="focus:outline-none focus:ring-2 focus:ring-gray-800 hover:bg-gray-100" role="button">
                    <svg className="w-10 h-10 lg:w-16 lg:h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M40 16L24 32L40 48" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </ButtonBack>
                </div>
                <div className="slider">
                  <div className="slide-ana lg:relative">
                    <Slider className="flex-grow">
                      {
                        product?.images?.map((image, idx) => (
                          <Slide key={image.id().id} index={idx}>
                            <div className="flex items-center">
                              <img src={image.url()} alt="Item" className="w-full  h-full" />
                            </div>
                          </Slide>
                        ))
                      }
                    </Slider>
                  </div>
                </div>
                <div className="flex items-center">
                  <ButtonNext role="button" aria-label="next slide" className="cursor-pointer ml-2">
                    <svg className="w-10 h-10 lg:w-16 lg:h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 16L40 32L24 48" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </ButtonNext>
                </div>
              </CarouselProvider>
              <div className="lg:w-1/2 flex flex-col justify-center mt-7 md:mt-8 lg:mt-0 pb-8 lg:pb-0">
                <h1 className="text-3xl lg:text-4xl font-semibold text-gray-800">{product?.data?.metadata.title}</h1>
                <p className="text-base leading-normal text-gray-600 mt-2">
                  <span className="mr-1">By</span>
                  <span className="text-gray-800">
                    <span className="mr-1">{product?.user?.firstName}</span><span className="mr-1">{product?.user?.lastName}</span>
                    {product?.user?.email && <a href={"mailto:" + product?.user?.email} className="mr-1"><span className="font-mono">{product?.user?.email}</span></a>}
                    {product?.user?.phoneNumber && <a href={"tel:" + product.user.phoneNumber} className="mr-1">(<span className="font-mono">{product?.user?.phoneNumber}</span>) </a>}
                  </span>
                </p>
                <p className="text-base leading-normal text-gray-600 mt-2">{product?.data?.metadata.category}</p>
                <p className="text-base leading-normal text-gray-600 mt-2">{product?.data?.metadata.description}</p>
                <p className="text-3xl font-medium text-gray-600 mt-8 md:mt-10 font-mono">{product?.data?.metadata.price && `$${product?.data?.metadata.price}`}</p>
              </div>
            </div>
          </div>
        </div>
        <style>{`
                .slider {
                    width: 200px;
                    height: 400px;
                    position: relative;
                    overflow: hidden;
                }
    
                .slide-ana {
                    height: 360px;
                }
    
                .slide-ana > div {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    transition: all 0.7s;
                }
    
                @media (min-width: 200px) and (max-width: 639px) {
                    .slider {
                        height: 300px;
                        width: 170px;
                    }
                }
            `}</style>
      </div>
    </NormalPage>
  </div>
}