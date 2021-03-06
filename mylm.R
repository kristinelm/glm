#Laster data
library(car)
library(GGally)
data(SLID, package = "car")
SLID <- SLID[complete.cases(SLID), ]

mylm <- function(formula, data = list(), contrasts = NULL, ...){
  # Extract model matrix & responses
  mf <- model.frame(formula = formula, data = data)
  X  <- model.matrix(attr(mf, "terms"), data = mf, contrasts.arg = contrasts)
  y  <- model.response(mf)
  terms <- attr(mf, "terms")

  #Storing variable names for use in summary
  variables=all.vars(formula)
  var_lev=colnames(X)

  #Finding dimensions
  p=length(var_lev)
  n=length(y)

  #Finding estimated coefficients
  betahat=((solve(t(X)%*%X))%*%t(X))%*%y

  #Finding the estimated sigma
  sigma2hat=(1/(n-p))*t(y-X%*%betahat)%*%(y-X%*%betahat)
  sigmahat=sqrt(sigma2hat)

  #Finding the covariance matrix of the estimated coefficients
  varbetahat=sigma2hat[1]*solve(t(X)%*%X)

  #Finding the standard errors of the estimated coefficients
  stderr=(sqrt(diag(varbetahat)))
  stderror=stderr[[1]]
  for(j in 2:length(stderr)){
    stderror<-c(stderror,stderr[[j]])
  }

  #Testing the significance of the coefficients (including intercept)
  z=numeric(p)
  pvalue=numeric(p)
  for(i in 1:p){
    z[i]<- (betahat[i])/(stderror[i])
    pvalue[i]= 2*pnorm(-abs(z[i]))
  }

  #Finding fitted values and raw residuals
  fittedvalues=X%*%betahat
  rawresiduals=y-X%*%betahat

  #Finding SSE, SST and R2
  SSE=t(rawresiduals)%*%rawresiduals
  SST=t(y-mean(y))%*%(y-mean(y))
  SSR=SST-SSE
  R2=1-(SSE/SST)

  #Finding Fobs, testing if the regression is significant when there is only one parameter being fitted (then SSE_Ho=SST)
  k=p-1
  r=k
  Fobs=(1/k)*(SST-SSE)/(SSE/(n-p))

  #Finding the pvalue of Fobs
  pvalueF=pchisq(r*Fobs,r,lower.tail=FALSE)

  #Using a z-statistic instead,
  #Multiply by 2 as sqrt(r*Fobs) follows the half-normal dist
  zstat=sqrt(r*Fobs)
  pvaluez=2*pnorm(-abs(zstat))

  #Finding Pearsons correlation coefficient
  Pearson=(t(X[,2]-mean(X[,2]))%*%(y-mean(y)))/(sqrt(SST)*sqrt(t(X[,2]-mean(X[,2]))%*%(X[,2]-mean(X[,2]))))

  #Collecting all output in a list
  est <- list(terms = terms, model = mf,coeffs=betahat,stderror=stderror,sigma2hat=sigma2hat,fv=fittedvalues,rres=rawresiduals, pvalue=pvalue,z=z ,SSR=SSR,SSE=SSE,SST=SST,R2=R2, Pearson=Pearson,Fobs=Fobs,pvalueF=pvalueF,pvaluez=pvaluez,vars=variables,var_lev=var_lev)

  # Store call and formula used
  est$call <- match.call()
  est$formula <- formula

  # Set class name. This is very important!
  class(est) <- 'mylm'

  # Return the object with all results
  return(est)
}

print.mylm <- function(object, ...){
  cat('Coefficients:\n')
  print.default(x=t(object$coeffs),digits=4,print.gap = 4)
}

summary.mylm <- function(object, ...){
  cat('Summary of object\n')

  #Make table with estimated value osv.
  df1=(nrow(object$coeffs)-1)
  df2=length(object$fv)-df1-1
  table=matrix(nrow=(nrow(object$coeffs)),ncol=5)
  table[1:nrow(table),1]=object$var_lev
  table[1:nrow(table),2]=round(object$coeffs,6)
  table[1:nrow(table),3]=round(object$stderror,6)
  table[1:nrow(table),4]=round(object$z,2)
  table[1:nrow(table),5]=format(object$pvalue,scientific = TRUE)

  #Print the table and the other values
  tabledf=as.data.frame(table)
  colnames(tabledf) <- c("","Estimate","Std.Error","z value","Pr(>|z|")
  print(format(tabledf),row.names=FALSE)
  cat("Residual standard error:",  round(sqrt(object$sigma2hat),3) , "on", df2,  " DF \n" )
  cat("Multiple R-squared:",round(object$R2,4), "\n" )
  cat("F-statistic:     ",round(object$Fobs,1) , "on", df1, "and", df2, "DF, p-value", object$pvalueF,"\n")
}

plot.mylm <- function(object, ...){
  library(ggplot2)
  dat <- data.frame(    yvar = object$rres,  xvar = object$fv)
  ggplot(dat, aes(x=xvar, y=yvar)) +
    geom_point(shape=1)+labs(x = "Fitted values")  +labs(y = "Raw residuals")

}

anova.mylm <- function(object, ...){

  # Components to test
  comp <- attr(object$terms, "term.labels")
  # Name of response
  response <- deparse(object$terms[[2]])
  # Fit the sequence of models
  txtFormula <- paste(response, "~", sep = "")


  model <- list()
  for(numComp in 1:length(comp)){
    if(numComp == 1){
      txtFormula <- paste(txtFormula, comp[numComp])
    }
    else{
      txtFormula <- paste(txtFormula, comp[numComp], sep = "+")
    }
    formula <- formula(txtFormula)
    model[[numComp]] <- mylm(formula = formula, data = object$model)
  }

  # Print Analysis of Variance Table
  cat('Analysis of Variance Table\n \n')
  cat(c('Response: ', response, '\n'), sep = '')
  results=matrix(nrow=(length(object$vars)),ncol=6)
  n=length(model[[1]]$fv)
  p=length(model[[length(comp)]]$coeffs)

  for(numComp in 1:length(comp)){
    if(numComp==1){
      r=length(model[[1]]$coeffs)-1
      #SSR here represents the change in SSE from fitting nothing
      results[numComp,3]=round(model[[1]]$SSR,0)
      results[numComp,4]=round((model[[1]]$SSR)/r,1)
      Fobs=((n-p)/r)*(model[[1]]$SSR)/model[[length(comp)]]$SSE
      pvalueF=pchisq(r*Fobs,r,lower.tail=FALSE)
      results[numComp,5]=round(Fobs,4)
      results[numComp,6]=format(pvalueF,scientific = TRUE)
    }
    else{
      r=length(model[[numComp]]$coeffs)-length(model[[numComp-1]]$coeffs)
      p=length(model[[numComp]]$coeffs)
      Fobs=(((n-p)/r)*((model[[numComp-1]]$SSE-model[[numComp]]$SSE)/model[[length(comp)]]$SSE))
      pvalueF=pchisq(r*Fobs,r,lower.tail=FALSE)
      results[numComp,3]=round((model[[numComp-1]]$SSE-model[[numComp]]$SSE),0)
      results[numComp,4]=round((model[[numComp-1]]$SSE-model[[numComp]]$SSE)/r,1)
      results[numComp,5]=round(Fobs,4)
      results[numComp,6]=format(pvalueF,scientific = TRUE)
    }
    results[numComp,1]=comp[numComp]
    results[numComp,2]=r
  }
  results[length(comp)+1,1]="Residuals"
  results[length(comp)+1,2]=n-p
  results[length(comp)+1,3]=round(model[[length(comp)]]$SSE,0)
  results[length(comp)+1,4]=round((model[[length(comp)]]$SSE)/(n-p),1)
  results[length(comp)+1,5]=""
  results[length(comp)+1,6]=""
  tabled=as.data.frame(results)
  colnames(tabled) <- c("","Df","Sum sq","Mean sq","X2 value","Pr(>|X2|")
  print(format(tabled),row.names=FALSE)
}

